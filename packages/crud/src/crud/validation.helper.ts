import { ValidationPipe } from '@nestjs/common';
import { isFalse } from '@nestjsx/util';

import { safeRequire } from '../util';
import { CrudValidationGroups } from '../enums';
import { CrudOptions, CreateManyDto } from '../interfaces';

const validator = safeRequire('class-validator');
const transformer = safeRequire('class-transformer');

export class Validation {
  static getValidationPipe(
    options: CrudOptions,
    group: CrudValidationGroups,
  ): ValidationPipe {
    return validator && !isFalse(options.validation)
      ? new ValidationPipe({ ...(options.validation || {}), groups: [group] })
      : undefined;
  }

  static createBulkDto<T = any>(options: CrudOptions): any {
    if (validator && transformer && !isFalse(options.validation)) {
      const { IsArray, IsNotEmpty, ValidateNested } = validator;
      const { Type } = transformer;
      const groups = [CrudValidationGroups.CREATE];

      class BulkDto implements CreateManyDto<T> {
        @IsArray({ each: true, groups })
        @IsNotEmpty({ groups })
        @ValidateNested({ each: true, groups })
        @Type((t) => options.model.type)
        bulk: T[];
      }
      return BulkDto;
    } else {
      class BulkDto implements CreateManyDto<T> {
        bulk: T[];
      }
      return BulkDto;
    }
  }
}
