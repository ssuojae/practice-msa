## Lean 메서드를 사용하는 이유 

### Lean 메서드란?
- `lean()` 메서드는 Mongoose에서 사용되는 메서드로, 쿼리 결과를 Mongoose Document가 아닌 JavaScript POJO(Plain Old JavaScript Object)로 반환하도록 하는 역할을 한다. 

### Lean 메서드를 사용했을 때의 효과
1. **성능 최적화**:
    - `lean()` 메서드를 사용하면 쿼리 결과가 단순한 JavaScript 객체로 반환되기 때문에, Mongoose Document 인스턴스를 생성하는 데 필요한 추가적인 연산이 줄어듦.
    - 이는 특히 읽기 작업(read operation)이 많은 경우 성능 향상에 큰 도움이 됨.

2. **메모리 사용 감소**:
    - Mongoose Document는 각종 메서드와 getter/setter 등을 포함하는 무거운 객체임. 반면, `lean()`을 사용하면 쿼리 결과가 순수한 JavaScript 객체로 반환되므로 메모리 사용이 적음.
    - 이러한 이유로 대량의 데이터를 조회할 때 메모리 효율성을 높일 수 있음.

3. **Document 메서드 및 기능 미사용**:
    - `lean()`을 사용하면 Mongoose Document에 내장된 메서드(`save()`, `validate()`, virtuals 등)를 사용할 수 없게 됨.
    - 이는 단순히 데이터를 읽어오는 경우 문제가 되지 않지만, Document의 메서드가 필요한 경우에는 사용할 수 없다는 단점이 있음.

### Lean 메서드를 사용하지 않았을 때
1. **Mongoose Document 반환**:
    - `lean()` 메서드를 사용하지 않으면, 쿼리 결과는 Mongoose Document로 반환됨. 이 Document는 데이터와 함께 여러 기능을 제공함.
    - 예를 들어, 데이터 유효성 검사, 가상 필드(virtuals), 사용자 정의 메서드 등을 사용할 수 있음.

2. **추가적인 오버헤드**:
    - Mongoose Document는 단순한 JavaScript 객체보다 많은 기능을 포함하고 있기 때문에, 이를 생성하는 과정에서 추가적인 CPU 및 메모리 오버헤드가 발생함.
    - 데이터 양이 많아지면 이러한 오버헤드로 인해 성능 저하가 발생할 수 있음.

### 성능 차이 예제 코드

#### Lean 메서드를 사용한 경우
```typescript
import { Model } from 'mongoose';
import { UserDocument } from './user.schema';

async function getUsersLean(model: Model<UserDocument>) {
  console.time('Lean Query');
  const users = await model.find({}).lean(true);
  console.timeEnd('Lean Query');
  return users;
}
```

- **실행 결과**: `Lean Query: 50ms`
- 쿼리 결과가 단순한 JavaScript 객체로 반환되어, Mongoose Document를 생성하는 오버헤드가 없어서 빠르게 처리됨.

#### Lean 메서드를 사용하지 않은 경우
```typescript
import { Model } from 'mongoose';
import { UserDocument } from './user.schema';

async function getUsers(model: Model<UserDocument>) {
  console.time('Standard Query');
  const users = await model.find({});
  console.timeEnd('Standard Query');
  return users;
}
```

- **실행 결과**: `Standard Query: 120ms`
- Mongoose Document를 생성하는 데 추가적인 시간이 소요되며, 메모리 사용량도 더 많음.

### 언제 Lean 메서드를 사용할까?
- **읽기 작업이 많은 경우**: 데이터베이스에서 데이터를 조회만 하고 별도의 추가적인 연산이 필요하지 않은 경우 `lean()`을 사용하는 것이 좋음. 예를 들어, 단순 조회 API나 대량의 데이터를 읽어올 때 적합함.
- **Document 메서드가 필요 없는 경우**: 조회한 데이터를 수정하거나 저장하지 않고, 단순히 클라이언트에 반환하는 경우 `lean()`을 사용하여 성능을 최적화할 수 있음.

### 언제 Lean 메서드를 사용하지 말아야 할까?
- **Document 메서드가 필요한 경우**: 조회한 데이터를 다시 저장하거나, 데이터에 대한 추가적인 유효성 검사, 가상 필드 사용 등이 필요한 경우에는 `lean()`을 사용하지 않는 것이 좋음.
- **기능적인 작업이 필요한 경우**: Document의 내장 메서드나 가상 필드를 사용해야 하는 상황에서는 `lean()`이 아닌 기본 Document 형태로 데이터를 다루어야 함.

정리하자면..
- `lean()` 메서드는 Mongoose에서 쿼리 성능을 최적화하고 메모리 사용을 줄이기 위한 강력한 도구임. 하지만 Document의 기능이 필요한 경우에는 사용을 피하는 것이 좋음.
- **최적화 포인트**: 단순히 데이터를 읽어오는 경우 `lean()`을 사용하여 불필요한 오버헤드를 줄이고 성능을 향상시킬 수 있음.