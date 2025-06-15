import { IsString, IsOptional, IsObject, IsArray } from 'class-validator';

export class WhatsAppWebhookDto {
    @IsString()
    object: string;

    @IsArray()
    entry: any[];
}

export class WhatsAppMessageDto {
    @IsString()
    id: string;

    @IsString()
    from: string;

    @IsString()
    type: string;

    @IsString()
    timestamp: string;

    @IsOptional()
    @IsObject()
    text?: {
        body: string;
    };

    @IsOptional()
    @IsObject()
    image?: {
        id: string;
        mime_type: string;
        sha256: string;
        caption?: string;
    };

    @IsOptional()
    @IsObject()
    document?: {
        id: string;
        mime_type: string;
        sha256: string;
        filename?: string;
        caption?: string;
    };

    @IsOptional()
    @IsObject()
    audio?: {
        id: string;
        mime_type: string;
        sha256: string;
    };

    @IsOptional()
    @IsObject()
    video?: {
        id: string;
        mime_type: string;
        sha256: string;
        caption?: string;
    };

    @IsOptional()
    @IsObject()
    interactive?: {
        type: string;
        button_reply?: {
            id: string;
            title: string;
        };
        list_reply?: {
            id: string;
            title: string;
            description?: string;
        };
    };
}

export class SendMessageDto {
    @IsString()
    to: string;

    @IsString()
    message: string;

    @IsOptional()
    @IsString()
    type?: string;
}
