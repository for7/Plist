# 对象属性描述符



`Object.defineProperty`， define Property 翻译成中文就是定义属性，顾名思义就是为对象定义或修改属性的细节，我们通过属性描述符来定义这些细节。所以使用该方法允许精确添加或修改对象的属性。熟悉 vue 的朋友对 defineProperty 因该不陌生

```javascript
Object.defineProperty(obj, prop, descriptor)
```

`defineProperty` 接受3个参数， obj 表示要修改或者定义属性的对象，prop 是要定义或者修改属性的名称， `descriptor` 属性描述符用于定义该属性的特性。

descriptor 是一个对象，对象里的属性描述符有两种主要形式：**数据描述符**和**存取描述符**。**数据描述符**是一个具有值的属性，该值可能是可写的，也可能不是可写的。**存取描述符**是由getter-setter函数对描述的属性。描述符必须是这两种形式之一；不能同时是两者。

数据描述符和存取描述符均具有一下可选键值（特性）：

- **configurable**: 如果为false，则任何尝试删除目标属性或修改属性以下特性（writable, configurable, enumerable）的行为将被无效化，默认值为 false。
- **enumerable**: 是否能枚举。也就是是否能被for-in遍历。默认值为 false
- **writable**: 是否能修改值。默认为 false
- **value**: 该属性的具体值是多少。默认为 undefined

存取描述符：

- **get**: 目标属性被访问就会调回此方法，并将此方法的运算结果返回用户。默认为 undefined
- **set**: 目标属性被赋值，就会调回此方法。默认为 undefined

描述符可同时具有的键值：

|            | configurable | enumerable | value | writable | get  | set  |
| ---------- | ------------ | ---------- | ----- | -------- | ---- | ---- |
| 数据描述符 | Yes          | Yes        | Yes   | Yes      | No   | No   |
| 存取描述符 | Yes          | Yes        | No    | No       | Yes  | Yes  |
如果一个描述符不具有value,writable,get 和 set 任意一个关键字，那么它将被认为是一个数据描述符。如果一个描述符同时有(value或writable)和(get或set)关键字，将会产生一个异常。所以 value、writable 与 get/set 不能同时设置。 


```javascript
var obj = {}
obj.a = 123

Object.defineProperty(obj, "newDataProperty", {
    value: 101, // 设置值
    writable: true, // 值可以被修改
    enumerable: true, // 可以被枚举
    configurable: true // 属性可以被删除、特性可以修改
})
```

上面给对象 obj 添加一个新属性 'newDataProperty'，并且设置了属性的特性。在ES5之前对象的属性我们只能设置一个字面量值或者一个引用，而浏览器支持`Object.defineProperty`方法之后，就像给了我们一台显微镜，能够在更低的粒度层控制属性的行为和特性：定义属性的可访问行、值的读写规则等。

如果对象中不存在指定的属性，`Object.defineProperty()`就创建这个属性。如果属性已经存在，`Object.defineProperty()`将尝试根据描述符中的值以及对象当前的配置来修改这个属性。如果旧描述符将其`configurable` 属性设置为`false`，则该属性被认为是“不可配置的”，并且没有属性可以被改变（除了单向改变 writable 为 false）。当属性不可配置时，不能在数据和访问器属性类型之间切换。描述符中未显示设置的特性使用其默认值。

下面用一些栗子来演示这些特性的具体表现：

#### configurable

```javascript
let foo = {
    a: 1
}
delete foo.a
Object.defineProperty(foo, 'b', {
    value: 2, // 默认值为2
    configurable: false // 不容许被删除和修改
})
delete foo.b // 无法删除
foo.b = 999 // 无法修改
console.log(foo.b) // 2 
```

#### **enumerable**

```javascript
let foo = {
    a: 1,
    b: 2,
    c: 3
}
for (let i in foo) {
    // a、b、c可以被枚举
    console.log(`key: ${i}, value: ${foo[i]}`)
}

Object.defineProperty(foo, 'a', {
    enumerable: false // 设置属性不可以被枚举
})
for (let i in foo) {
    // a没有被枚举
    console.log(`key: ${i}, value: ${foo[i]}`)
}
```

#### writable

```javascript
let foo = {
    a: 1
}
// 修改 foo.a 的值
foo.a = 2 
console.log(foo.a) // 2

Object.defineProperty(foo, 'a', {
    writable: false // 设置值不能被修改
})
// 尝试修改 foo.a 的值
foo.a = 3 // 无法修改
console.log(foo.a) // 2
```

#### value

```javascript
let foo = {}
Object.defineProperty(foo, 'a', {
    value: 1 // 设置属性的值为 1
})
console.log(foo.a) // 1
```

#### get/set

```javascript
let foo = {
    a: 1
}
Object.defineProperty(foo, 'b', {
    get: function () {
        return `hi, ${this.value}`
    },
    set: function (value) {
        this.a = value // 将输入值保存在同对象下属性 a 里
        this.value = value + 1
    }
})
console.log(foo.b) // 'hi, undefined'
foo.b = 1
console.log(foo.a) // 1
console.log(foo.b) // hi, 2
```

注意： get没有参数，set接受实参为当前设置的值.。在get、set函数内部可以通过`this.value`访问`value`特性，从而通过该特性来获取或者着设置属性的值。get/set 常用于值依赖内部数据的场合。需要尽量同时设置get、set。如果仅仅只设置了get，那么我们将无法设置该属性值。如果仅仅只设置了set，我们也无法读取该属性的值。

`Object.defineProperty`只能设置一个属性的描述符，当需要设置多个属性描述符时可以使用`Object.defineProperties`：

```javascript
let foo = {}
Object.defineProperties(foo, {
    a: {
        value: 1,
        configurable: true
    },
    b: {
        get: function() {
            return this.value ? `hi, ${this.value}` : 0
        },
        set: function(value) {
            this.value = value + 1
        }
    }
})

console.log(foo.a) // 1
console.log(foo.b) // 0
foo.b = 2
console.log(foo.b) // 'hi, 3'
```

我们可以通过`Object.getOwnPropertyDescriptor`获取某一属性的特性集合：

```javascript
let foo = {
    a: 1
}
Object.defineProperty(foo, 'a', {
    value: 2, // 设置值为 2
    writable: false, // 值不可修改
    configurable: false // 设置属性不可删除，特性不可修改
})
let fooDescripter = Object.getOwnPropertyDescriptor(foo, 'a')

console.log(fooDescripter)
// 获取的特性如下
// {
//   configurable:false,
//   enumerable:true,
//   value:2,
//   writable:false
// }
```

这里需要注意`Object.defineProperty`创建一个新属性和修改一个已经存在属性的描述符默认值是有区别的，创建一个新属性默认描述符的键值都是 false 或者 undefined。而修改一个已经存在的属性的描述符时，如果之前没有被设置过或者说通过原始方式给对象添加的属性，则属性的 configurable、enumerable、writable 描述符都默认为 true。举个例子：

```javascript
let foo = {}
Object.defineProperty(foo, 'a', {
    value: 2 // 设置值为 2
})
let fooDescripter = Object.getOwnPropertyDescriptor(foo, 'a')

console.log(fooDescripter)
// 获取的特性如下
// {
//   configurable:false,
//   enumerable: false,
//   value:2,
//   writable:false
// }
```

变量 a 是通过  `Object.defineProperty`方法创建的，获取到的数值描述符都是 false。 我们可以通过最后两个代码示例体会一下区别。