## Omit 타입 활용

`AbstractRepository` 클래스의 `create` 메서드에서 **`Omit` 타입**을 사용하여 MongoDB 문서를 생성할 때 `_id` 필드를 제외한 나머지 속성들만 받도록 정의했다.

```typescript
type TDocument = {
  _id: Types.ObjectId;
  name: string;
  email: string;
  age: number;
  address: string;
};

async create(document: Omit<TDocument, '_id'>): Promise<TDocument> {
  const createdDocument = new this.model({
    ...document,
    _id: new Types.ObjectId(),
  });
  return (await createdDocument.save()).toJSON() as unknown as TDocument;
}
```

### Omit 역할
- **`Omit<TDocument, '_id'>`**: 주어진 타입 `TDocument`에서 **`_id` 필드를 제외**한 타입을 의미한다.
- **이유**: 문서를 생성할 때 `_id`는 MongoDB가 자동으로 생성하거나, 이 코드에서처럼 **직접 생성**할 수 있으므로, 사용자로부터는 `_id`를 받지 않도록 한다.
- 이를 통해 **코드의 안정성**이 높아지고, 잘못된 데이터 입력을 방지할 수 있다.

