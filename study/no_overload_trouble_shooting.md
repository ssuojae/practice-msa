## TypeScript 에러 해결: "No overload matches this call."

### 문제 설명
NestJS와 Mongoose를 사용하여 리포지토리를 구현하던 중, 다음과 같은 TypeScript 에러가 발생했음:

```typescript
const duplicate = await this.model.findOne({ [key]: value }).lean(true);
```

에러 메시지:

```
Type error: No overload matches this call.
```

#### 에러 발생한 코드 (수정 전)
```typescript
private async checkForDuplicateBeforeUpdate(
  update: UpdateQuery<TDocument>,
): Promise<void> {
  if (!update.$set) return;

  const entries = Object.entries(update.$set) as [string, any][];
  const fieldsToCheck = entries.filter(([key]) =>
    this.uniqueFields.includes(key as keyof TDocument),
  );

  await Promise.all(
    fieldsToCheck.map(async ([key, value]) => {
      const duplicate = await this.model.findOne({ [key]: value }).lean(true);
      if (duplicate) {
        this.logger.warn(`Duplicate key error for ${key} field`, {
          [key]: value,
        });
        throw new ConflictException(
          `Duplicate key error: The value provided for the ${key} field is already in use.`,
        );
      }
    }),
  );
}
```

### 원인 분석
- TypeScript가 동적 객체 키 (`{ [key]: value }`)를 사용하여 `findOne` 메서드에 전달할 때, 해당 객체의 타입을 정확하게 추론하지 못해 발생한 에러이다. 
- `findOne` 메서드는 여러 오버로드 시그니처를 가지며, 컴파일러는 어떤 오버로드를 사용해야 할지 결정하지 못했다.

에러 메시지 요약:
- `findOne` 메서드 호출 시 전달된 인수의 타입이 예상된 타입과 일치하지 않음.
- 동적 키를 사용한 객체 리터럴이 `FilterQuery<TDocument>` 타입으로 인식되지 않음.

### 해결 방법
- TypeScript에게 객체의 타입을 명시적으로 지정하여 컴파일러가 올바른 오버로드 시그니처를 선택하도록 도와주었다.

#### 수정 후 코드
```typescript
private async checkForDuplicateBeforeUpdate(
  update: UpdateQuery<TDocument>,
): Promise<void> {
  if (!update.$set) return;

  const entries = Object.entries(update.$set) as [string, any][];
  const fieldsToCheck = entries.filter(([key]) =>
    this.uniqueFields.includes(key as keyof TDocument),
  );

  for (const [key, value] of fieldsToCheck) {
    const query: FilterQuery<TDocument> = { [key]: value } as FilterQuery<TDocument>;
    const duplicate = await this.model.findOne(query).lean(true);
    if (duplicate) {
      this.logger.warn(`Duplicate key error for ${key} field`, {
        [key]: value,
      });
      throw new ConflictException(
        `Duplicate key error: The value provided for the ${key} field is already in use.`,
      );
    }
  }
}
```

### 수정 사항 설명
1. **쿼리 객체의 타입 명시적 지정**:
    ```typescript
    const query: FilterQuery<TDocument> = { [key]: value } as FilterQuery<TDocument>;
    ```
    - `query` 객체를 `FilterQuery<TDocument>` 타입으로 명시적으로 캐스팅하여 TypeScript가 해당 타입을 인식하도록 했다.
    - 이를 통해 `findOne` 메서드에 전달되는 인수의 타입이 명확해져 오버로드 매칭 문제가 해결되었다.

2. **for...of 루프로 변경**:
    - `await Promise.all`과 `map`을 사용하는 대신, `for...of` 루프를 돌렸다.
    - 각 중복 체크를 순서대로 진행하여 예기치 않은 동시성 문제를 피할 수 있다.

TypeScript에서 동적 객체 키를 사용할 때는 타입 추론 문제가 발생할 수 있으므로, 객체의 타입을 명시적으로 지정하는 것이 좋음. 이번 에러는 `findOne` 메서드에 전달되는 쿼리 객체의 타입을 명시적으로 지정하여 해결할 수 있었음.

### 참고 자료
- [TypeScript Error: "No overload matches this call." - GitHub Issue #52369](https://github.com/microsoft/TypeScript/issues/52369)

#### 요약
- **에러 원인**: TypeScript가 동적 객체 키를 가진 객체의 타입을 추론하지 못함.
- **해결 방법**: 쿼리 객체의 타입을 명시적으로 `FilterQuery<TDocument>`로 지정.
- **추가 팁**: TypeScript 타입 오류가 발생할 때는 전달되는 인수의 타입과 메서드의 오버로드 시그니처를 확인하고, 필요 시 타입 캐스팅을 통해 컴파일러가 올바른 타입을 인식하도록 도와줌.