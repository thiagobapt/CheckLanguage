// Definição de Tokens e Lexer (Tokenizador)
// lexer.ts
export enum TokenType {
  Plus = "+",
  Minus = "-",
  Multiply = "*",
  Divide = "/",
  LeftParen = "(",
  RightParen = ")",
  Number = "NUMBER",
  Name = "NAME",
  Equals = "=",
  Semicolon = ";",
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
  For = "FOR"
}

export class Token {
  constructor(public type: TokenType, public value: string) {}
}

export class Lexer {
  private position: number = 0;
  private currentChar: string | null = null;

  constructor(private readonly input: string) {
    this.currentChar = input.length > 0 ? input[0] : null;
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

  private number(): Token {
    let result = "";
    while (this.currentChar !== null && /[0-9]/.test(this.currentChar)) {
      result += this.currentChar;
      this.advance();
    }
    return new Token(TokenType.Number, result);
  }

  private name(): Token {
    let result = "";
    while (
      this.currentChar !== null &&
      /[a-zA-Z_][a-zA-Z0-9_]*/.test(this.currentChar)
    ) {
      result += this.currentChar;
      this.advance();
    }
    if (result === "if") return new Token(TokenType.If, result);     // implementação do IF
    if (result === "else") return new Token(TokenType.Else, result); // implementação do Else

    if (result === "while") return new Token(TokenType.While, result); // implementação do While
    if (result === "for") return new Token(TokenType.For, result); // implementação do For

    return new Token(TokenType.Name, result);
  }

  public getNextToken(): Token {
    const operatorTokens: { [key: string]: TokenType } = {
      "+": TokenType.Plus,
      "-": TokenType.Minus,
      "*": TokenType.Multiply,
      "/": TokenType.Divide,
      "(": TokenType.LeftParen,
      ")": TokenType.RightParen,
      "=": TokenType.Equals,
      ";": TokenType.Semicolon,
      "{": TokenType.LeftBracket,
      "}": TokenType.RightBracket,
    };

    while (this.currentChar !== null) {
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
        const token = new Token(
          operatorTokens[this.currentChar],
          this.currentChar
        );
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
