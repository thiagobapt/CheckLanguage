# Check Language
An interpreted language written in Typescript.

Experiment with Check Language in the [code sandbox](https://thiagobapt.github.io/CheckLanguage/)!


## Grammar
```
<program>                ::= <statement> | <statement> <program>
<statement_list>         ::= <statement> ( <statement> )*
<statement>              ::= <assignment> 
                            | <initialization> 
                            | <expression> ";"
                            | <if_statement>
                            | <while_statement>
                            | <for_statement>
<initialization>         ::= "var" <name> "=" <expression> ";"
<assignment>             ::= <name> "=" <expression> ";"
<if_statement>           ::= "if" "(" <conditional> ")" "{" <statement_list> "}" ("else" "{" <statement_list> "}" )
<while_statement>        ::= "while" "(" <conditional> ")" "{" <statement> "}"
<for_statement>          ::= "for" "(" <assignment> ";" <conditional> ";" <statement> ")" "{" <statement> "}"
<function>               ::= <name> "(" <expression_list> ")" ( ";" )
<function_declaration>   ::= "function" <name> "(" <parameter_declaration> ")" "{" statement_list return_statement "}"
<return_statement>       ::= "return" statement ";"
<expression_list>             ::= { <expression> | ( "," <expression> )* }
<parameter_declaration>  ::= { <types> <name> | ( "," <types> <name> )* }
<expression>             ::= <term> { ("+" | "-") <term> }
<term>                   ::= <factor> { ("*" | "/") <factor> }
<factor>                 ::= <number> 
                            | <name> 
                            | <string>
                            | <boolean>
                            | <array>
                            | <function>
                            | "(" <expression> ")"
<conditional>            ::= <bool_term> { ("or") <bool_term> }
<bool_term>              ::= <bool_factor> { ("and") <bool_factor> }
<bool_factor>            ::= <expression> <relational_operator> <expression>
<relational_operator>    ::= "==" | "!=" | "<" | "<=" | ">" | ">="
<number>                 ::= [0-9]+
<array>                  ::= "[" <expression> ("," <expression>)* "]"
<name>                   ::= [a-zA-Z_][a-zA-Z0-9_]*
<string>                 ::= '"' .* '"'
<comment>                 ::= '/*' .* '*/'
<types>                  ::= ( "string"| "number" | "bool" | "array" )
```

## Dictionary

"var", "if", "else", "while", "for", "function", "return", "string", "number", "bool", "array", "true", "false"
