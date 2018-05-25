# this

这一节我们来探讨this。 在 javascript 中 this 也是一个神的存在，相对于 java 等语言在编译器确定，而在 javascript 中， this 是动态绑定，也就是在运行期绑定的。这导致了 javascript 中 this 的灵活性，与此同时对识别函数不同的调用场景下 this 指向带来了一些困扰。

this 是函数内部的可见属性, 在函数内部我们可以直接使用`this`访问`指定对象`的相关属性。那么`指定对象`是如何确定的？


# this 是在什么时候确定的？

this 是在函数被调用时发生的绑定，它指向什么完全取决于函数在哪里被调用（在什么对象里被调用）。所以关键点是函数在哪里被调用。

所以我们下面主要解释函数在不同调用场景下`this`的指向。

** 如果函数调用时是被某一个对象所拥有，函数内的`this`将绑定到该对象上。如果函数是独立调用的，则函数内部的 this 在严格模式下为 undefind, 在非严格模式下 this 会指向 window（node.js中指向global）。**

根据上面的理解，我们首要判断的是函数被`谁`所拥有，举几个栗子更好理解：

栗子1：

```javascript
let a = 1
function foo () {
    console.log(this.a)
}

foo() // 1
```

 foo() 是在全局环境下独立调用的，此时函数 foo 被全局对象拥有（this 指向 window），所以`this.a`获取的是 window 全局对象下面的 a.

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

函数执行时确定 this 指向的大致逻辑：

`foo() `:

- 在全局对象 window 下调用，所以输出1。

 `too.b()`:

 - 对象 too 的属性 b 指向函数 foo，此时函数 foo 是 对象 too 内部的一个方法;
 - `too.b()`执行时，b 是被对象 too调用的，此时内部的 this 指向 对象 too;
 - 所以`this.a`获取的是`too.a`，输出2;

`bar()`:  

- 对象 too 的方法被赋值给 bar, 即此时 bar 标识符同 foo 标识符一样都指向同一个栈地址所代表的函数。
- 执行`bar()`此时在全局对下 window 下调用，所以输出1。

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

这个栗子很容易搞错（我自己感觉每过一段时间再看还是会错o(︶︿︶)o），第一印象输出的应该是2，那是应为把 this 与作用域链弄混淆了。始终要记住作用域链是在源代码编码阶段就确定了，而 this 是在函数运行阶段才确定，属于`执行上下文`的概念，是在运行阶段依据 `this`所在函数被谁调用来确定的。
`too(foo)` ：这里函数 foo 作为参数被传递到函数 too的内部执行， `fn()`执行时并没有被其他对象显示拥有，所以我们隐式的判定`fn()`是在全局对象 window 下面执行的，所以输出 1 。

我们再来把上面的栗子稍微修改一下

栗子4：
```JavaScript
var a = 1
var foo = function () {
    console.log(this.a) // 输出 1
    console.log(a) // 区别在这里， 输出 1
}
var too = function (fn) {
    var a = 2
    fn()
}
too(foo) // 1, 1
```

| 表达式 | - | - | 值 |
| ------ | - | - | - |
| `console.log(this.a)` | 基于 this | 表达式所属 foo 函数在 too 函数内调用时 this 指向 window | 1 |
| `console.log(a)`  | 基于作用域链 | 全局上下文中的变量 a 在 foo 函数作用域链上 | 1 |

不知道你理解了没有。这个栗子也可以用来理解`上下文`与`作用域`的区别

栗子5：

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

foo.a.b() // 3
```

`this`的绑定只受最靠近的成员引用的影响。`foo.a.b()`函数`b`作为对象`foo.a`的方法被调用，所以此时的`this`绑定到`foo.a`。`b`与对象`foo`的包含成员没有多大关系，最靠近的对象才决定`this`的绑定。

最后`console.log(this.c)`取到的是`foo.a`里`c`的值 3 .  

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

too.msg() // hi, 2
```

上面用对象`foo`作为原型创建新对象`too`, 所以对象 too 继承对象 foo 的所有属性、方法。`too.msg()`执行时，msg 函数被 too 调用，此时`this`就指向对象`too`, 所以`console.log(`hi, ${this.a}`)`访问的是从对象`foo`继承来的 a.

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
