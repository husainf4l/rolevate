import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transcript } from './transcript.entity';
import { CreateTranscriptInput } from './create-transcript.input';
import { UpdateTranscriptInput } from './update-transcript.input';
import { InterviewTranscriptSummary } from './interview-transcript-summary.dto';

@Injectable()
export class TranscriptService {
  constructor(
    @InjectRepository(Transcript)
    private transcriptRepository: Repository<Transcript>,
  ) {}

  async create(createTranscriptInput: CreateTranscriptInput): Promise<Transcript> {
    const transcript = this.transcriptRepository.create(createTranscriptInput);
    const savedTranscript = await this.transcriptRepository.save(transcript);
    return Array.isArray(savedTranscript) ? savedTranscript[0] : savedTranscript;
  }

  async createBulk(createTranscriptInputs: CreateTranscriptInput[]): Promise<Transcript[]> {
    const transcripts = this.transcriptRepository.create(createTranscriptInputs);
    return this.transcriptRepository.save(transcripts);
  }

  async findAll(): Promise<Transcript[]> {
    return this.transcriptRepository.find({
      relations: ['interview'],
      order: { timestamp: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Transcript | null> {
    return this.transcriptRepository.findOne({
      where: { id },
      relations: ['interview'],
    });
  }

  async findByInterviewId(interviewId: string): Promise<Transcript[]> {
    return this.transcriptRepository.find({
      where: { interviewId },
      relations: ['interview'],
      order: { timestamp: 'ASC' },
    });
  }

  async update(id: string, updateTranscriptInput: UpdateTranscriptInput): Promise<Transcript | null> {
    await this.transcriptRepository.update(id, updateTranscriptInput);
    return this.findOne(id);
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.transcriptRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async removeByInterviewId(interviewId: string): Promise<number> {
    const result = await this.transcriptRepository.delete({ interviewId });
    return result.affected ?? 0;
  }

  // Get transcript summary for an interview
  async getInterviewTranscriptSummary(interviewId: string): Promise<InterviewTranscriptSummary | null> {
    const transcripts = await this.findByInterviewId(interviewId);
    if (transcripts.length === 0) return null;

    const speakers = [...new Set(transcripts.map(t => t.speaker))];
    const timestamps = transcripts.map(t => t.timestamp.getTime());
    const duration = timestamps.length > 1
      ? Math.max(...timestamps) - Math.min(...timestamps)
      : 0;

    return {
      totalTranscripts: transcripts.length,
      speakers,
      duration,
      language: transcripts[0]?.language || 'english',
    };
  }
}
