## Joi의 역할과 사용 방법

**Joi**는 Node.js와 TypeScript 환경에서 **데이터 유효성 검증**을 위해 사용되는 라이브러리로, 특히 환경 변수나 사용자 입력의 형식과 조건을 검증하는 데 유용하다. NestJS와 같은 프레임워크에서 많이 사용되며, 데이터가 예상된 형식을 만족하는지 확인해 안전하고 일관된 애플리케이션 동작을 보장한다.

### 주요 역할

1. **환경 변수 검증**
    - NestJS와 같은 애플리케이션에서, 환경 변수(`.env`)의 값을 **유효성 검사**하여 잘못된 형식의 값이 설정되지 않도록 방지한다. 예를 들어, 데이터베이스 URI가 문자열 형식인지, 포트 번호가 올바른 숫자인지 등을 미리 확인할 수 있다.

2. **안전성 보장**
    - 애플리케이션이 시작될 때 환경 변수가 올바르게 설정되어 있는지 검증함으로써, **잘못된 설정으로 인해 발생할 수 있는 오류**를 예방한다. 이를 통해 예기치 않은 문제나 장애 상황을 미리 방지할 수 있다.

3. **유연한 검증 규칙 설정**
    - Joi는 다양한 데이터 타입(문자열, 숫자, 배열 등)과 복잡한 조건(최소 길이, 정규식 패턴 등)을 검증할 수 있는 유연한 검증 규칙을 제공한다. 예를 들어, 특정 값이 반드시 있어야 하거나, 최소한의 길이 또는 특정 형식을 만족해야 하는 경우에도 쉽게 설정할 수 있다.

### 사용 예시

다음은 NestJS에서 `ConfigModule`과 함께 **Joi**를 사용하여 환경 변수를 검증하는 예시이다:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().uri().required(),
        PORT: Joi.number().integer().min(1).max(65535).default(3000),
      }),
    }),
  ],
})
export class AppModule {}
```

#### 예제 설명

- `MONGODB_URI`: **문자열**이어야 하며, **URI 형식**이어야 하고 반드시 존재해야 한다는 조건을 설정.
- `PORT`: **숫자** 타입이어야 하며, **1에서 65535 사이의 정수**여야 하고, 값이 주어지지 않으면 기본값으로 3000을 사용하도록 설정.

### 추가 예시

다음은 사용자 입력 데이터를 Joi로 검증하는 예시이다:

```typescript
import Joi from 'joi';

const userSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
  birth_year: Joi.number().integer().min(1900).max(2023),
});

// 사용 예시
const result = userSchema.validate({
  username: 'johndoe',
  password: 'password123',
  birth_year: 1990,
});

if (result.error) {
  console.error('유효성 검사 실패:', result.error.details);
} else {
  console.log('유효성 검사 성공:', result.value);
}
```

#### 예제 설명

- `username`: **알파벳과 숫자**만 포함해야 하며, 최소 3자에서 최대 30자까지 가능.
- `password`: **알파벳과 숫자**로 구성된 최소 3자에서 최대 30자까지의 문자열이어야 함.
- `birth_year`: **1900년부터 2023년까지의 정수**여야 함.


- Joi는 데이터 유효성 검증을 통해 애플리케이션이 예상치 못한 데이터 입력으로 인해 발생할 수 있는 문제를 미리 방지하는 역할을 한다. 
- 환경 변수 검증 외에도 사용자 입력 데이터 검증, API 요청 데이터 검증 등 다양한 상황에서 유용하게 사용할 수 있다.

