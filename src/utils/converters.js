function _getValue(names, type, value) {
  if (names.length > 0) {
    const formatted = names.reduce( (acc, name) => {
      const subValue = value ? value[name]: null
      acc[name] = format(type[name], subValue)
      return acc
    }, {})
    return formatted
  }
  return value || type.default 
}

export function format(type, value){
  const isArrayType = type instanceof Array
  const fieldType = isArrayType ? type[0]: type

  const names = Object.keys(fieldType).filter(name => (name.indexOf('_') && name.indexOf('default')))
  
  if (isArrayType) {
    if (!Array.isArray(value)) {
      return []
    }
    const arrayFormatted = value.map(val => {

      if (fieldType._format) {
        if (val) {
          return fieldType._format(val)
        }
        return fieldType.default
      }
      return _getValue(names, fieldType, val)
    })
    return arrayFormatted
  }

  if (fieldType._format) {
    if (value) {
      return fieldType._format(value)
    }
    return fieldType.default
  }
  return _getValue(names, fieldType, value)
}

export function save(type, name, value, old, options) {
  const isArrayType = Array.isArray(type)
  const fieldType = isArrayType ? type[0]: type
  const children = []

  const { _save } = fieldType
  if (_save ) {
    const { isAtomic, name: newName, format, create, before, after } = _save
    if (isArrayType) {
      if (isAtomic) {
        const newValue = format ? format(value, old) : value
        console.log('before to 1')
        return {
          name: newName || name,
          save: create ? create(newValue, old): null,
          children: []
        }
      } else {
        const { beforeAll } = _save
        return value.map((val, index) => {
          const oldVal = old && old[index]
          const newVal = format ? format(val, oldVal) : val
          return save(fieldType, `${name}:${index}`, newVal, oldVal, options)
        })
      }
    } else {
      const children = []
      const names = Object.keys(fieldType).filter(name => (name.indexOf('_') && name.indexOf('default')))
      const data = names.reduce((acc, name) => {
        const subValue = value[name]
        const subOldValue = old && old[name]
        const subType = fieldType[name]
        const isArray = Array.isArray(subType)
        const subFieldType = isArray ? subType[0]: subType

        const { _save: _subSave } = subFieldType

        if (_subSave) {
          const { isAtomic, name: newName, format, create, } = _subSave
          if (create) {
            children.push(save(subType, name, subValue, subOldValue, options))
          } else {
            acc[newName || name] = format ? format(subValue, subOldValue) : subValue
          }
        } else {
          acc[name] = subValue
        }
        return acc
      }, {})

      return {
        name,
        children,
        save: create ?  create(value, old, data) : null
      }
    }
  }
}

export function runSave(tree, parent, services, options) {
  if (Array.isArray(tree)) {
    const requests = tree.map( subTree => {
      return new Promise((resolve, reject) => {
        const { name, save, children } = subTree
        console.log('Saving: %o', name)

        if (save) {
          const { action, request } = save(parent, services, options)
          if (request) {
            request.then(response => {
              return response.json()
            })
            .then(part => {
              resolve({
                result: part,
                children: children.map(child => runSave(child, part, services, options))
              })
            })
          } else {
            console.log('not a request')
            console.log(action)
            resolve(null)
          }
        } else {
          resolve(null)
        }
      })
    })
    return Promise.all(requests)
  }
  return new Promise((resolve, reject) => {
    const { name, save, children } = tree
    console.log('Saving: %o', name)

    if (save) {
      const { action, request } = save(parent, services, options)
      if (request) {
        request.then(response => {
          return response.json()
        })
        .then(part => {
          resolve({
            result: part,
            children: children.map(child => runSave(child, part, services, options))
          })
        })
      } else {
        console.log(action)
        console.log('something wrong')
        console.log(request)
        resolve(null)
      }
    } else {
      resolve(null)
    }
  })
}

//export function save(type, value, oldValue, preValue, services, name, options = {}) {
  //const isArrayType = type instanceof Array
  //const fieldType = isArrayType ? type[0]: type

  //const names = Object.keys(fieldType).filter(name => (name.indexOf('_') && name.indexOf('default')))

  //const children = []
  //const data = names.reduce((acc, name) => {
    //const subType = fieldType[name]
    //const isArray = Array.isArray(subType)
    //const subFieldType = isArray ? subType[0]: subType

    //if(subFieldType._save) {
      //const { _save } = subFieldType
      //if (typeof _save === 'function') {
        //if(isArray) {
          //const { _preSaveAll, _asUnit }  = subFieldType
          //if (_asUnit) {
            //const preValue = _preSaveAll && _preSaveAll(value[name], oldValue[name])
            //children.push(subFieldType, value[name], oldValue, preValue, services, name, options)
          //} else {
            //const { _preSaveAll } = subFieldType
            //const preValue = _preSaveAll && _preSaveAll(value[name], oldValue[name])
            //const list = value[name].map((val, index) => {
              //return save(subFieldType, val, oldValue[name][index], preValue, services, name, options)
            //})
            //children.push(list)
          //}
        //} else {
          //children.push(save(subFieldType, value[name], oldValue && oldValue[name], {}, services, name, options))
        //}
      //}
      //else if(typeof _save === 'object') {
        //const { name: newName, format } = _save
        //acc[newName] = format(value[name])
      //}
    //} else {
      //acc[name] = value[name]
    //}

    //return acc
  //}, {})

  //const { _save, _beforeSaveAll } = fieldType
  //const hasNames = !Object.keys(data).length
  //const saveObj = hasNames
    //? typeof _save === 'function' && _save(data, oldValue[name], preValue)
    //: _save(value, oldValue, preValue)

  //const beforeSave = typeof _beforeSaveAll=== 'function' ? _beforeSaveAll(value, oldValue[name], preValue)
    //: null

  //return {
    //name,
    //beforeSave,
    //save: saveObj,
    //children,
  //}


//}



export function buildData(specs, data = {}, options = {}) {
  const names = Object.keys(specs).filter(name => name.indexOf('_'))
  return names.reduce( (acc, name) => {
    const spec = specs[name]
    const type = spec.type || spec
    const value = (data && data[name]) || spec.default || null
    const isArray = type instanceof Array

    let result 
    if (isArray) {
      result = value.reduce((subAcc, val) => {
        const built = spec.build ? spec.build(val, data, options): val
        built && subAcc.push(built)
        return subAcc
      }, [])
      //console.log(result)
    } else {
      result = spec.build ? spec.build(value, data, options): value
    }

    acc[name] = result

    return acc;
  }, {})
}

export function removeNotValid(specs, data = {}, options = {}) {
  const names = Object.keys(specs).filter(name => name.indexOf('_'))
  return names.reduce( (acc, name) => {
    acc[name] = data[names]
    return acc;
  }, {})
}

export function saveData(specs, data, options) {
  const children = []
  let isNew = false
  const names = Object.keys(specs).filter(name => name.indexOf('_'))

  const instance = names.reduce( (acc, name) => {
    const spec = specs[name]
    const type = spec.type || spec
    const value = (data && data[name]) || spec.default || null

    const isArray = type instanceof Array
    const save = spec.save

    if (name === 'id' && value.indexOf('fake') === 0) {
      isNew = true
    } else {
      if (spec.spec) {
        children.push({
          name: name,
          value: isArray ? value.map(val => saveData(spec.spec, val, options)) : saveData(spec.spec, value, options),
        })
      }
      else if (save) {
        if (isArray) {
          if (typeof save === 'object') {
            acc[save.field || name] = save.value(value)
          } else if (typeof save === 'function') {
            const newValue = value.map (val => save(val, data, options))
            if (newValue.length) {
              children.push ({
                name: name,
                value: newValue,
              })
            }
          } else {
            acc[name] = value
          }
        }
        else {
          if (typeof save === 'object') {
            acc[save.field || name] = save.value(value)
          } else if (typeof save === 'function') {
            const newValue = save(value, data, options)
            if (newValue) {
              children.push({
                name: name,
                value: newValue,
              })
            }
          } else {
            acc[name] = value
          }
        }
      } else {
        acc[name] = value
      }
    }
    return acc
  }, {})

  const main = specs._save(isNew, instance)

  return {
    children,
    instance: main,
  }
}


export function doRequests(specs, info, data) {
  return (dispatch, getState) => {
    const { instance, children } = info
    //console.log(info)
    if (instance) {
      const { name, request } = instance(data)

      request.then(response => {
        if (response.ok) {
          //console.log('ok')
          return response.json()
        }
      })
      .then(data => {
        dispatch({
          type: 'TEST_' +name.success,
          payload: {
            result: data,
          }
        })
        
        if (specs) {
          children.forEach(child => {
            const { name, value } = child
            const spec = specs[name]
            const type = spec.type || spec
            const isArray = type instanceof Array

            if (isArray) {
              value.forEach(val => {
                dispatch(doRequests(spec.spec, val, data))
              })
            } else {
              dispatch(doRequests(spec.spec, value, data))
            }
          })
        }
      })
      .catch(error => {
        console.log('error')
        console.log(error)
      })

      return {
        type: 'RUN_REQUESTS'
      }
    } else {
      dispatch(doRequests(null, {
        instance: info,
        children: [],
      }, data))
    }
    return {
      type: 'RUN_REQUESTS_ENDED',
    }
  }
}
