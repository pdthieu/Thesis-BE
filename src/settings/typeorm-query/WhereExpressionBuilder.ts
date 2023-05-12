import { ObjectLiteral } from 'typeorm';

declare module 'typeorm/query-builder/WhereExpressionBuilder' {
  interface WhereExpressionBuilder {
    /** Run callback when condition is true */
    when(
      this: WhereExpressionBuilder,
      condition: any,
      callback: (qb: WhereExpressionBuilder) => any,
      elseCallback?: (qb: WhereExpressionBuilder) => any,
    ): WhereExpressionBuilder;

    /** Group where clauses by parenthesis */
    whereGroup(
      this: WhereExpressionBuilder,
      callback: (qb: WhereExpressionBuilder) => any,
      parameters?: ObjectLiteral,
    ): WhereExpressionBuilder;

    /** Group where clauses by parenthesis */
    orWhereGroup(
      this: WhereExpressionBuilder,
      callback: (qb: WhereExpressionBuilder) => any,
      parameters?: ObjectLiteral,
    ): WhereExpressionBuilder;

    /** Group where clauses by parenthesis */
    andWhereGroup(
      this: WhereExpressionBuilder,
      callback: (qb: WhereExpressionBuilder) => any,
      parameters?: ObjectLiteral,
    ): WhereExpressionBuilder;
  }
}
