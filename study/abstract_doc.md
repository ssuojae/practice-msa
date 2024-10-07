
## AbstractDocument를 통한 `_id` 중복 해결

- NestJS와 Mongoose를 사용하여 데이터를 관리할 때, 모든 데이터 모델에 **고유 식별자**인 `_id` 필드를 포함해야 한다. 
- 이때, 각 모델에 `_id` 필드를 반복적으로 작성하면 **코드 중복**이 발생하고, 유지보수가 어려워질 수 있다. 이를 해결하기 위해 `AbstractDocument` 클래스를 사용하여 **중복을 줄이고 코드의 일관성**을 유지할 수 있다.

### AbstractDocument의 역할

- `AbstractDocument`는 모든 데이터 모델에 공통적으로 필요한 `_id` 필드를 정의한 **추상 클래스**이다. 
- 이를 상속받는 다른 모델들은 `_id` 필드를 자동으로 가지게 된다.

```typescript
import { Prop, Schema } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

@Schema()
export class AbstractDocument {
  @Prop({ type: SchemaTypes.ObjectId })
  _id: Types.ObjectId;
}
```

- **`_id` 필드**: MongoDB에서 각 문서를 고유하게 식별하는 **ObjectId** 타입의 필드로 정의된다.
- 이 클래스를 상속받는 모든 모델은 `_id` 필드를 자동으로 포함하게 된다.

### AbstractDocument 사용 예시

```typescript
import { AbstractDocument } from './abstract-document';
import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class User extends AbstractDocument {
  @Prop()
  name: string;

  @Prop()
  email: string;
}
```

위 예시에서 `User` 클래스는 `AbstractDocument`를 **상속**받아 `_id` 필드를 자동으로 가지게 된다. 이를 통해 모든 모델에 **중복 없이 고유 식별자**를 설정할 수 있으며, 코드의 **유지보수성**과 **일관성**이 높아진다.

### AbstractDocument 장점

1. **코드 중복 감소**: 모든 데이터 모델에 `_id` 필드를 반복해서 작성하지 않아도 된다.
2. **유지보수성 향상**: `_id`와 관련된 변경 사항이 있을 때, `AbstractDocument`만 수정하면 모든 하위 클래스에 반영된다.
3. **일관성 보장**: 모든 모델이 동일한 방식으로 `_id`를 가지므로 데이터 모델 간의 일관성이 유지된다.
