## NestJS 프로젝트에서의 MongoDB 사용하기


### Mongoose 통합 설정

1. **설치 및 설정**
    - 먼저 필요한 패키지들인 `@nestjs/mongoose`와 `mongoose`를 설치했다.
    - 그런 다음, 루트 `AppModule`에서 Mongoose를 설정하여 MongoDB에 연결을 설정했다:
      ```typescript
      import { Module } from '@nestjs/common';
      import { MongooseModule } from '@nestjs/mongoose';
 
      @Module({
        imports: [MongooseModule.forRoot('mongodb://localhost/nest')],
      })
      export class AppModule {}
      ```
    - `forRoot()` 메서드를 사용해 로컬에서 실행 중인 MongoDB 인스턴스에 연결했다.

<br/>

2. **데코레이터를 사용한 스키마 정의**
    - `@nestjs/mongoose`의 `@Schema()`와 `@Prop()` 데코레이터를 사용해 `ReservationDocument` 스키마를 정의했다:
      ```typescript
      import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
      import { AbstractDocument } from '@app/common/database/abstract.schema';
 
      @Schema({ versionKey: false })
      export class ReservationDocument extends AbstractDocument {
        @Prop()
        timestamp: Date;
 
        @Prop()
        startDate: Date;
 
        @Prop()
        endDate: Date;
 
        @Prop({ unique: true })
        userId: string;
 
        @Prop({ unique: true })
        invoiceId: string;
      }
 
      export const ReservationSchema = SchemaFactory.createForClass(ReservationDocument);
      ```
    - 여기서 `@Prop()`은 `ReservationDocument`의 속성을 정의하는 데 사용된다. `userId`와 `invoiceId` 필드는 중복 입력을 방지하기 위해 고유하게 설정되었다.

<br/>

3. **@InjectModel()을 통한 모델 주입**
    - `ReservationsRepository`에서 `@InjectModel()` 데코레이터를 사용해 `ReservationDocument` 모델을 주입했다:
      ```typescript
      import { Injectable, Logger } from '@nestjs/common';
      import { InjectModel } from '@nestjs/mongoose';
      import { Model } from 'mongoose';
      import { AbstractRepository } from '@app/common/database/abstract.repository';
      import { ReservationDocument } from './models/reservation.schema';
 
      @Injectable()
      export class ReservationsRepository extends AbstractRepository<ReservationDocument> {
        protected readonly logger = new Logger(ReservationsRepository.name);
 
        constructor(
          @InjectModel(ReservationDocument.name)
          reservationModel: Model<ReservationDocument>,
        ) {
          super(reservationModel);
        }
      }
      ```
    - `@InjectModel(ReservationDocument.name)`을 사용해 `ReservationsRepository`가 `ReservationDocument` 모델과 상호작용할 수 있게 하여, MongoDB의 `reservations` 컬렉션에 대해 CRUD 작업을 수행할 수 있도록 했다.

<br/>

- **데코레이터 사용**: `@Schema()`와 `@Prop()` 데코레이터를 사용하면 MongoDB 스키마 정의 시 보일러플레이트 코드를 크게 줄일 수 있어 코드가 간결하고 가독성이 좋아진다.
- **모델 주입**: `@InjectModel()`을 사용하면 Mongoose 모델을 서비스나 리포지토리 클래스에 쉽게 주입할 수 있어 MongoDB 컬렉션에 접근하는 것이 간편하고 효율적이다.
- **고유 제약 조건**: `userId`와 `invoiceId` 필드에 `unique: true`를 적용하여 데이터 무결성을 유지하고 중복 입력을 방지했다.

