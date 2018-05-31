
## css字符截断（文字超出省略）

- 单行
```css
.text-overflow-ellipsis {
   -o-text-overflow: ellipsis;
   text-overflow: ellipsis;
   /* height: 30px;*/	  
   overflow: hidden;
   white-space: nowrap;
  }
```

- 多行实现溢出省略
```css
@mixin boxClamp($v:1){
  overflow:hidden;
  -webkit-line-clamp: $v;
  line-clamp: $v;
  -webkit-box-orient: vertical;
  box-orient: vertical;
  display:-webkit-box;
  display:box;
}
```

- 在Sass中完全可以定义一个Mixins来解决单行还是多行字符串截断：
```sass
  @mixin ellipsis-overflow($line: 1, $substract: 0) {
    @if $line == 1 {
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    @else {
      display: -webkit-box;
      -webkit-line-clamp: $line;
      -webkit-box-orient: vertical;
    }
    width: 100% - $substract;
    overflow: hidden;
    }
```

- 使用JS来截取字符串：
```javascript
function truncateString (str, num, endChar) {
  var truncd = '';
  if (str.length <= num) {
    truncd = str;
  }
  else if (num <= endChar.length) {
    truncd = str.slice(0, num).trim() + endChar;
  }
  else {
    truncd = str.slice(0, num - endChar.length).trim() + endChar;
  }
  return truncd;
  }

  truncateString('但如果我们需要指定其他特殊符号', 3, '...')
  // "但如果..."
```
