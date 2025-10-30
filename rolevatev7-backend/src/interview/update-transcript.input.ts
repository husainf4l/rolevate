import { InputType, PartialType } from '@nestjs/graphql';
import { CreateTranscriptInput } from './create-transcript.input';

@InputType()
export class UpdateTranscriptInput extends PartialType(CreateTranscriptInput) {}
