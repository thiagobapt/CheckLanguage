/**
 * Grammar for numerical expressions
 * "E" is a numerical expression
 * "T" is the term of a numerical expression
 * "F" is a factor (Multiplication)
 * "N" is a number
 * "V" is a variable
 * <E> ::= <T> { ("+" | "-") <T>}
 * <T> ::= <F> { ("*" | "/")} <F>
 * <F> ::= <N> | <V> | "(" <E> ")"
 * <N> ::= [0-9]+
 * <V> ::= [a-zA-Z][a-zA-Z]*
 */

//Definition of the token types
enum TokenType {
    Plus = "+",
    Minus = "-",
    Multiply = "*",
    Divide = "/",
    LeftParen = "(",
    RightParen = ")",
    Number = "NUMBER",
    Name = "NAME",
    EOF = "EOF"
}

class Token {
    constructor (
        public type: TokenType, public value: string
    ) {};
}

//Lexical analiser
class Lexer {
    private position: number = 0;
    private currentChar: string | null = null;

    constructor(private input: string) {
        this.currentChar = input.length > 0 ? input[0] : null;
    };

    //Moves the character position
    private advance(): void {
        this.position++;
        this.currentChar = this.position > this.input.length ? this.input[this.position] : null;
    }

    private skipWhitespace(): void {
        while( this.currentChar !== null && /\s/.test(this.currentChar)) {
            this.advance();
        }
    }

    private number(): Token {
        let result = "";
        while(this.currentChar !== null && /[0-9]/.test(this.currentChar)) {
            result += this.currentChar;
            this.advance();
        }
        return new Token(TokenType.Number, result);
    }

    private name(): Token {
        let result = "";
        while(this.currentChar !== null && /[a-zA-Z]/.test(this.currentChar)) {
            result += this.currentChar;
            this.advance();
        }
        return new Token(TokenType.Name, result);
    }

    private getNextToken(): Token {
        const operatorTokens: { [key: string]: TokenType } = {
            "+": TokenType.Plus,
            "-": TokenType.Minus,
            "*": TokenType.Multiply,
            "/": TokenType.Divide,
            "(": TokenType.LeftParen,
            ")": TokenType.RightParen
        };

        while(this.currentChar !== null) {
            if(/\s/.test(this.currentChar)) {
                this.skipWhitespace();
                continue;
            }
            if(/[0-9]/.test(this.currentChar)) {
                return this.number();
            }
            if(/[a-zA-Z]/.test(this.currentChar)) {
                return this.name();
            }
            if(operatorTokens[this.currentChar]) {
                const token = new Token(
                    operatorTokens[this.currentChar], this.currentChar
                );
                this.advance();
                return token;
            }
            throw new Error("Invalid character")
        }
        return new Token( TokenType.EOF, "");
    }
}

interface ASTNode {
    type: string;
    id: number;
}

class BinaryOpNode implements ASTNode {
    id: number;
    constructor(
        public left: ASTNode, // Left node of the operation
        public operator: string, // Operator of the operation (Ex: +. -. *, /)
        public right: ASTNode // Right node of the operation
    ) {
        this.id = ASTNodeCounter.getNextId(); // Defines a unique ID for the node
    }
    type: string = "BinaryOp"; // Defines the node type as binary operation
}

class NumberNode implements ASTNode {
    id: number;
    constructor(
        public value: string
    ) {
        this.id = ASTNodeCounter.getNextId(); // Defines a unique ID for the node
    }
    type: string = "Number"; // Defines the node type as binary operation
}

class NameNode implements ASTNode {
    id: number;
    constructor(
        public value: string
    ) {
        this.id = ASTNodeCounter.getNextId(); // Defines a unique ID for the node
    }
    type: string = "Name"; // Defines the node type as binary operation
}

class ASTNodeCounter {
    public static currentId: number = 0;
    public static getNextId(): number {
        return ++this.currentId;
    }
}

class Parser {
    private currentToken!: Token;

    constructor(private lexer: Lexer) {
        this.currentToken = this.lexer.getNextToken();
        
    }
}