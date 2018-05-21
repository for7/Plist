## this

这一节我们来探讨this。 在 javascript 中 this 也是一个神的存在，相对于 java 等语言在编译器确定，而在 javascript 中， this 是动态绑定，也就是在运行期绑定的。这导致了 javascript 中 this 的灵活性，与此同时对识别函数不同的调用场景下 this 指向带来了一些困扰。

在上下文一篇中我们讲了 this 是在函数上下文的创建阶段被确定的。那么 this 是怎么确定的呢？



##### 如果函数调用时是被某一个对象所拥有，函数内的`this`将绑定到该对象上。如果函数是独立调用的，则函数内部的 this 在严格模式下为 undefind, 在非严格模式下 this 会指向 window（node.js中指向global）。

所以我们判断的首要条件就是函数是被 ‘谁’ 拥有。

栗子1：

```javascript
let a = 1
function foo () {
    console.log(this.a)
} 

foo() // 1
```

 foo() 是在全局环境下独立调用的，这个时候 this 指向 window，所以`this.a`获取的是 window 全局对象下面的 a. 

栗子2：

```javascript
var a = 1
var foo = function (){
    console.log(this.a)
}
var too = {
    a: 2,
    b: foo
}
var bar = too.b

foo() // 1
too.b() // 2
bar() // 1
```

`foo() `: 依然是在全局对象 window 下被调用的，所以输出1。

 `too.b()`: 对象 too 的属性 b 指向函数 foo，此时函数 foo 是 对象 too 内部的一个方法。且`too.b()`执行时，b 是被对象 too调用的，此时内部的 this 指向 对象 too，所以`this.a`获取的是`too.a`，输出2;。

`bar()`:  对象 too 的方法被赋值给 bar, 即此时 bar 标识符同 foo 标识符一样都指向同一个栈地址所代表的函数。执行`bar()`依然是在全局对下 window 下被调用的，所以输出1。

栗子3：

```javascript
var a = 1
var foo = function () {
    console.log(this.a)
}
var too = function (fn) {
    var a = 2
    fn()
}
too(foo) // 1
```

这个栗子很容易搞错，第一印象输出的应该是2，那是应为把 this 与作用域链弄混淆了。始终要记住作用域链是在源代码编码阶段就确定了，而 this 是在函数运行阶段才确定。`too(foo)` 这里函数 foo 作为参数被传递到函数 too的内部执行， `fn()`执行时没有被其他对象显示拥有，所以我们隐式的判定`fn()`是在全局对象 window 下面执行的，此时输出1。

栗子4：

```javascript
let c = 1
let foo = {
    c: 2
}
let too = function () {
    console.log(this.c)
}
foo.a = {
    b: too,
    c: 3
}
 
foo.a.b() // 2
```

`this`的绑定只受最靠近的成员引用的影响。`foo.a.b()`函数`b`作为对象`foo.a`的方法被调用，所以此时的`this`绑定到`foo.a`。`b`与对象`foo`的包含成员没有多大关系，最靠近的对象才决定`this`的绑定。

栗子5：

```javascript
let a = 1
let foo = {
    a: 2,
    msg: function () {
        console.log(`hi, ${this.a}`)
    }
}
let too = Object.create(foo)

foo.msg() // hi, 2
```

对于在对象原型链上某处定义的方法，同样的概念也适用。如果该方法存在于一个对象的原型链上，那么`this`指向的是调用这个方法的对象，就像该方法在对象上一样。

经过上面的几个栗子我们可以这样认为：当函数作为对象方法调用时 this 指向该对象，作为函数独立调用时 this 指向全局对象 window (严格模式下 this 为 undefind )。



##### 如果函数作为构造函数调用，则函数内部的 this 指向该实例自身

```javascript
function Foo (a) {
    this.a = a
}
let too = new Foo(1)
```

我们知道函数的 this 在运行期确定，而构造函数执行时在内部其实是为我们创建了一个新的对象。`new`操作符执行时执行了一下步骤：

1. 创建一个新的空对象；
2. 将构造函数的 this 指向这个新对象；
3. 将构造函数的原形添加到新对象的原形链里，将属性、方法挂载在新对象上；
4. 返回这个新对象

因此，当 new 操作符调用构造函数时，this 是指向内部创建的新对象，最后会将新创建的对象返回给实例变量。所以我们说如果函数作为构造函数调用，则函数内部的 this 绑定到该实例上。



#####如果函数使用 call/apply 方法调用执行，则 this 指向 call/apply 方法传入的对象

在 javascript 里函数也是对象。 函数的原形链上都存在 Function 构造函数，而  call/apply 存在于Function.prototype 的原形上。call/apply 主要用于向函数注入 this 和变量。call 与 apply  主要的区别在于传递的参数不一样。

```javascript
let a = 1
let too = {
    a: 2
}
function foo () {
    console.log(this.a)
}
foo.call(too) // 2
```

如果传递给 `this` 的值不是一个对象，JavaScript 会尝试使用内部 `ToObject` 操作将其转换为对象。因此，如果传递的值是一个原始值比如 `7` 或 `'foo'`，那么就会使用相关构造函数将它转换为对象，所以原始值 `7` 会被转换为对象，像 `new Number(7)` 这样，而字符串 `'foo'` 转化成 `new String('foo')` 这样。

```javascript
function bar() {
  console.log(Object.prototype.toString.call(this));
}

//原始值 7 被隐式转换为对象
bar.call(7); // [object Number]
```

ECMAScript 5 引入了 `Function.prototype.bind`。所以每个函数调用`f.bind(someObject)`会创建一个与`f`具有相同函数体和作用域的函数，但是在这个新函数中，`this`将永久地被绑定到了`bind`对象`someObject`。

```javascript
let a = 1
let too1 = {
    a: 2
}
function foo () {
    console.log(this.a)
}
let bar = foo.bind(too1)
let bar2 = {
    a: 4,
    b: bar
}

bar() // 2
bar.call({a: 3}) // 2
bar2.b() // 2
```

当`foo` 通过`bind`创建一个新函数时，新函数的`this`强制绑定到了传入的对象`too1`, 后续执行中`bar`即使是作为对象方法调用还是使用call/apply注入其他对象都无法改变之前的`this`。



#####如果函数是以箭头函数方式创建的，则此时的 this 指向箭头函数执行时的宿主函数的上下文

```javascript
function foo () {
    let that = this
    let too = () => {
        console.log(this === that) // true
    }
    too()
}
foo()
```

too 为箭头函数，内部的 this 被设置为他创建时的上下文，即 foo 的 this 。反过来说就是箭头函数没有自己的上下文，他共享的是封闭词法上下文的`this`。



