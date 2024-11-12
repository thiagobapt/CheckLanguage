// Definição de Tokens e Lexer (Tokenizador)
// lexer.ts
export enum TokenType {
  Plus = "+",
  Minus = "-",
  Multiply = "*",
  Divide = "/",
  Modulus = "%",
  LeftParen = "(",
  RightParen = ")",
  Number = "NUMBER",
  Boolean = "BOOLEAN",
  String = "STRING",
  Quotation = "\"",
  CloseQuotation = "CLOSE_QUOTATION",
  Name = "NAME",
  Equals = "=",
  Semicolon = ";",
  Comma = ",",
  EOF = "EOF",
  EqualsEquals = "==",
  LessThan = "<",
  MoreThan = ">",
  NotEquals = "!=",
  LessThanOrEquals = "<=",
  MoreThanOrEquals = ">=",
  If = "IF",
  Else = "ELSE",
  LeftBracket = "{",
  RightBracket = "}",
  While = "WHILE",
  For = "FOR",
  Var = "VAR",
  Function = "FUNCTION",
  FunctionDeclaration = "FUNCTION_DECLARATION",
  Type = "TYPE",
  Return = "RETURN",
  CommentStart = "/*",
  CommentEnd = "*/"
}

export class Token {
  constructor(public type: TokenType, public value: string) {}
}

export class Lexer {
  private position: number = 0;
  private currentChar: string | null = null;
  private previousTokenType: TokenType = TokenType.EOF;

  constructor(private readonly input: string) {
    this.currentChar = input.length > 0 ? input[0] : null;
  }

  public setPreviousTokenType(type: TokenType) {
    this.previousTokenType = type;
  }

  private advance() {
    this.position++;
    return this.currentChar = this.position < this.input.length ? this.input[this.position] : null;
  }

  private skipWhitespace(): void {
    while (this.currentChar !== null && /\s/.test(this.currentChar)) {
      this.advance();
    }
  }

  private skipComment() {
    while(true) {
      if(this.currentChar === "*") {
        if(this.advance() === "/") break;
      }
      this.advance();
    }
  }

  private number(): Token {
    let result = "";
    while (this.currentChar !== null && /[0-9]/.test(this.currentChar)) {
      result += this.currentChar;
      this.advance();
    }
    this.previousTokenType = TokenType.Number;
    return new Token(TokenType.Number, result);
  }

  private name(): Token {
    let result = "";

    let regexp = this.previousTokenType === TokenType.Quotation ? /^[^"]*$/ : /^[a-zA-Z0-9_]*$/;
    while (
      this.currentChar !== null &&
      regexp.test(this.currentChar)
    ) {
      result += this.currentChar;
      this.advance();
    }
    
    if(this.previousTokenType === TokenType.Quotation) {
      this.previousTokenType = TokenType.String;
      return new Token(TokenType.String, result);
    }

    if (
      result === "true" ||
      result === "false"
    ) {
      this.previousTokenType = TokenType.Boolean;
      return new Token(TokenType.Boolean, result); // implementação do Boolean
    }

    if (
      result === "string" ||
      result === "number" ||
      result === "bool"
    ) {
      return new Token(TokenType.Type, result); // implementação do Types
    }

    if (result === "return") {
      return new Token(TokenType.Return, result);     // implementação do Return
    }
    if (result === "if") {
      return new Token(TokenType.If, result);     // implementação do IF
    }
    if (result === "else"){
      return new Token(TokenType.Else, result); // implementação do Else
    }

    if (result === "while") {
      return new Token(TokenType.While, result); // implementação do While
    }
    if (result === "for") {
      return new Token(TokenType.For, result); // implementação do For
    }
    if (result === "var") {
      return new Token(TokenType.Var, result); // implementação de inicialização
    }
    if (result === "function") {
      return new Token(TokenType.FunctionDeclaration, result); // implementação de declaração de funções
    }

    if(this.previousTokenType === TokenType.FunctionDeclaration) {
      return new Token(TokenType.Name, result);
    }

    if (this.lookAhead().type === TokenType.LeftParen) {
      return new Token(TokenType.Function, result);
    }
    
    return new Token(TokenType.Name, result);
  }

  public getNextToken(): Token {
    const operatorTokens: { [key: string]: TokenType } = {
      "+": TokenType.Plus,
      "-": TokenType.Minus,
      "*": TokenType.Multiply,
      "%": TokenType.Modulus,
      "/": TokenType.Divide,
      "(": TokenType.LeftParen,
      ")": TokenType.RightParen,
      "=": TokenType.Equals,
      ";": TokenType.Semicolon,
      "{": TokenType.LeftBracket,
      "}": TokenType.RightBracket,
      "\"": TokenType.Quotation,
      ",": TokenType.Comma
    };

    while (this.currentChar !== null) {

      if (this.previousTokenType === TokenType.Quotation) {
        return this.name();
      }

      if(this.currentChar === "/") {
        if(this.advance() === "*") this.skipComment();
        continue;
      }

      if (/\s/.test(this.currentChar)) {
        this.skipWhitespace();
        continue;
      }

      if (/[0-9]/.test(this.currentChar)) {
        return this.number();
      }

      if (/[a-zA-Z_]/.test(this.currentChar)) {
        return this.name();
      }

      if (this.currentChar === "=") {
        this.advance();
        // Implementação da igualdade 
        if (this.currentChar === "=") {
          this.advance();
          return new Token(TokenType.EqualsEquals, "==");
        }
        return new Token(TokenType.Equals, "=");
      }

      if (this.currentChar === "!") {
        const nextChar = this.advance();
        if (nextChar === "=") {
          this.advance();
          return new Token(TokenType.NotEquals, "!=");
        }
      }

      if (this.currentChar === "<") {
        const nextChar = this.advance();
        if (nextChar === "=") {
          this.advance();
          return new Token(TokenType.LessThanOrEquals, "<=");
        }
        return new Token(TokenType.LessThan, "<");
      }

      if (this.currentChar === ">") {
        const nextChar = this.advance();
        if (nextChar === "=") {
          this.advance();
          return new Token(TokenType.MoreThanOrEquals, ">=");
        }
        return new Token(TokenType.MoreThan, ">");
      }

      if (operatorTokens[this.currentChar]) {
        let token = new Token(
          operatorTokens[this.currentChar],
          this.currentChar
        );

        if(this.previousTokenType === TokenType.String && operatorTokens[this.currentChar] === TokenType.Quotation) {
          token = new Token(
            TokenType.CloseQuotation,
            this.currentChar
          );
        } else {
          this.previousTokenType = operatorTokens[this.currentChar];
        }
        
        this.advance();
        return token;
      }

      throw new Error(`Invalid character: ${this.currentChar}`);
    }

    return new Token(TokenType.EOF, "");
  }

  public lookAhead(): Token {
    const currentPos = this.position;
    const token = this.getNextToken();
    this.position = currentPos;
    this.currentChar = this.input[this.position] || null;
    return token;
  }

}
