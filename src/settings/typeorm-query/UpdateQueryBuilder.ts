import {
  Brackets,
  ObjectLiteral,
  UpdateQueryBuilder,
  WhereExpressionBuilder,
} from 'typeorm';

declare module 'typeorm/query-builder/UpdateQueryBuilder' {
  interface UpdateQueryBuilder<Entity> {
    /** Run callback when condition is true */
    when(
      this: UpdateQueryBuilder<Entity>,
      condition: any,
      callback: (qb: UpdateQueryBuilder<Entity>) => any,
      elseCallback?: (qb: UpdateQueryBuilder<Entity>) => any,
    ): UpdateQueryBuilder<Entity>;

    whereGroup(
      this: UpdateQueryBuilder<Entity>,
      callback: (qb: WhereExpressionBuilder) => any,
      parameters?: ObjectLiteral,
    ): UpdateQueryBuilder<Entity>;

    andWhereGroup(
      this: UpdateQueryBuilder<Entity>,
      callback: (qb: WhereExpressionBuilder) => any,
      parameters?: ObjectLiteral,
    ): UpdateQueryBuilder<Entity>;

    orWhereGroup(
      this: UpdateQueryBuilder<Entity>,
      callback: (qb: WhereExpressionBuilder) => any,
      parameters?: ObjectLiteral,
    ): UpdateQueryBuilder<Entity>;
  }
}

UpdateQueryBuilder.prototype.when = function <Entity>(
  this: UpdateQueryBuilder<Entity>,
  condition: any,
  callback: (qb: UpdateQueryBuilder<Entity>) => UpdateQueryBuilder<Entity>,
  elseCallback?: (qb: UpdateQueryBuilder<Entity>) => UpdateQueryBuilder<Entity>,
): UpdateQueryBuilder<Entity> {
  if (condition) return callback(this);
  if (elseCallback) return elseCallback(this);
  return this;
};

UpdateQueryBuilder.prototype.whereGroup = function <Entity>(
  this: UpdateQueryBuilder<Entity>,
  callback: (qb: WhereExpressionBuilder) => any,
  parameters?: ObjectLiteral,
): UpdateQueryBuilder<Entity> {
  return this.where(new Brackets(callback), parameters);
};

UpdateQueryBuilder.prototype.andWhereGroup = function <Entity>(
  this: UpdateQueryBuilder<Entity>,
  callback: (qb: WhereExpressionBuilder) => any,
  parameters?: ObjectLiteral,
): UpdateQueryBuilder<Entity> {
  return this.andWhere(new Brackets(callback), parameters);
};

UpdateQueryBuilder.prototype.orWhereGroup = function <Entity>(
  this: UpdateQueryBuilder<Entity>,
  callback: (qb: WhereExpressionBuilder) => any,
  parameters?: ObjectLiteral,
): UpdateQueryBuilder<Entity> {
  return this.orWhere(new Brackets(callback), parameters);
};
