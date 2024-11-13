# Check Language
An interpreted language written in Typescript.

Experiment with Check Language in the [code sandbox](https://thiagobapt.github.io/CheckLanguage/)!

## Writing code in Check Lang

### Variable declaration and assignement

Variables are declared following this syntax `"var" name "=" expression ";"`.
For example: `var example = 1;` or using an expression `var example = 2 * (3 - 4);`

You can assign a new value to a variable following this syntax `name "=" expression ";"`.
For example `example = 2;` or using an expression `var example = 10 + (2 * 3);`

### If statements

In Check Lang, an If Statement is writting following this syntax `"if" "(" condition ")" "{" statement* "}" ( "else" "{" statement* "}" )?`.
What  this means is that an "else" statement is optional and you can have as many statements inside the brackets as you want.
