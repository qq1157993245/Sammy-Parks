import { Field, ObjectType, InputType } from 'type-graphql';

@ObjectType()
export class TicketType {
  @Field(() => String)
  id!: string;

  @Field(() => Number)
  price!: number;

  @Field(() => String)
  violation!: string;
}

@ObjectType()
export class TicketData {
  @Field(() => String, { nullable: true })
  driverId?: string;

  @Field(() => String)
  violation?: string;

  @Field(() => Boolean)
  overridden?: boolean;

  @Field(() => Boolean)
  paid?: boolean;

  @Field(() => Number)
  price?: number;

  @Field(() => String, { nullable: true })
  issuedBy?: string;

  @Field(() => String)
  createdAt?: string;

  @Field(() => Boolean, { nullable: true })
  challenged?: boolean;

  @Field(() => String, { nullable: true })
  challengeMessage?: string;

  @Field(() => Boolean, { nullable: true })
  challengeDenied?: boolean;

  @Field(() => Boolean, { nullable: true })
  challengeAccepted?: boolean;
}

@ObjectType()
export class Ticket {
  @Field(() => String)
  id!: string;

  @Field(() => TicketData)
  data!: TicketData;
}

@InputType()
export class TicketInput {
  @Field(() => String, { nullable: true })
  driverId?: string;

  @Field(() => String)
  type!: string;
}
