import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum SmtpEncryption {
  NONE = 'none',
  SSL = 'ssl',
  TLS = 'tls',
}

export class EmailSettingsDto {
  @IsOptional()
  @IsString()
  mailDriver?: string;

  @IsString()
  @IsNotEmpty({ message: 'SMTP Host không được để trống' })
  smtpHost: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  smtpPort: number;

  @IsEnum(SmtpEncryption, { message: 'Kiểu mã hóa SMTP không hợp lệ (none/ssl/tls)' })
  smtpEncryption: SmtpEncryption;

  @IsString()
  @IsNotEmpty({ message: 'Tài khoản SMTP User không được để trống' })
  smtpUser: string;

  @IsOptional()
  @IsString()
  smtpPassword?: string;

  @IsString()
  @IsNotEmpty({ message: 'Tên người gửi (From Name) không được để trống' })
  fromName: string;

  @IsEmail({}, { message: 'From Email không đúng định dạng' })
  fromEmail: string;

  @IsOptional()
  @IsEmail({}, { message: 'Reply-To Email không đúng định dạng' })
  replyToEmail?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Admin Alert Email không đúng định dạng' })
  adminAlertEmail?: string;

  @IsOptional()
  @IsBoolean()
  enableOrderAlertAdmin?: boolean;

  @IsOptional()
  @IsBoolean()
  enableWelcomeMail?: boolean;
}

export class TestEmailConnectionDto {
  @IsEmail({}, { message: 'Email nhận thử nghiệm không đúng định dạng' })
  @IsNotEmpty({ message: 'Email nhận thử nghiệm không được để trống' })
  targetEmail: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => EmailSettingsDto)
  customSettings?: EmailSettingsDto;
}
