// 手写 深拷贝
/*
	-- 明确问题：内存共享导致...
	-- 考虑引用类型的几种情况：对象 数组 日期 函数
	-- 考虑对象本身的属性：基本值，symbol，原型上面的属性和 enumerable: false 的属性
*/

const data= {
    name: 'djp',
    age: 18,
		parents: ['dad', 'mom'],
		date: new Date(), // 日期需要特殊处理
		body: {
			height: 180,
			weight: 50
		},
		func: function() {return 1}
}

// 定义一个无法枚举的属性
Object.defineProperty(data, 'weight', {
	value: '100kg',
	enumerable: false
})

// 给 data 设置原型属性
data.__proto__ = {
	run: true,
	country: 'China',
	cities: {
		one: 'chongqing',
		two: 'chengdu'
	}
}

// 浅拷贝
function shallowClone(data) {
	// 筛选出对象，返回非对象
	const isObject = typeof data === 'function' ||
		(typeof data === 'object' && typeof data !== null)
	if (!isObject) return data

	// 遍历对象，复制数据
	const clonedData = {}

	for (let key in data) {
		clonedData[key] = data[key]
	}
	return clonedData
}

function isObject(data) {
	// 该方法仅能区分基本类型和对象，无法区分数组、函数和对象
	return typeof data === 'function' ||
	  (typeof data === 'object' && typeof data !== null)
}
// 区分对象、数组和函数
function toType(data) {
	const type =  Object.prototype.toString.call(data)
	return type.split(' ')[1].toLowerCase().slice(0, -1)
}

// 初级版
function deepClone1(data) {
	// 筛选出对象，返回非对象
	if (!isObject(data)) return data

	// 函数的引用有点怪，没改变值..
	// 考虑值分别为对象和数组的情况
	const clonedData = toType(data) === 'object' ? {} :[]
	
	// 遍历对象，复制数据
	for (let key in data) { // for..in 对 enumerable: false 的属性无法枚举，但原型属性可以
		if (!isObject(data[key])) {
			clonedData[key] = data[key]
		} else {
			clonedData[key] = deepClone1(data[key])
		}
	}
	return clonedData
}

// 进一步解决了原型继承的问题
function deepClone2(data) {
	// 筛选出对象，返回非对象
	if (!isObject(data)) return data

	// 函数的引用有点怪，没改变值..
	// 考虑值分别为对象和数组的情况
	const clonedData = toType(data) === 'object' ? {} :[]
	clonedData.__proto__ = {} // 默认原型为一个对象
	// 遍历对象，复制数据
	const copyData = Object.create(Object.getPrototypeOf(data),
	  Object.getOwnPropertyDescriptors(data))
	for (let key in data) { // for..in 对 enumerable: false 的属性无法枚举，但原型属性可以
		if (data.hasOwnProperty(key)) { // 自身可枚举属性
			if (!isObject(data[key] && (toType(data[key]) === 'date'))) {
				console.log('date', data[key])
				clonedData[key] = data[key]
			} else {
				clonedData[key] = deepClone2(data[key])
			}
		} else { // 当属性来自原型的时候
			if (!isObject(data[key])) {
				clonedData.__proto__[key] = data[key]
			} else {
				clonedData.__proto__[key] = deepClone2(data[key])
			}
		}
	}
	return clonedData
}
// 先用 Object.create(proto, desc) 复制一次数据，然后用 Reflect.ownKeys 遍历覆盖


let dd = deepClone2(data)