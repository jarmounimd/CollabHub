import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/services/users.service';
import { MailService } from '../../mail/mail.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { JwtPayload } from '../strategies/jwt.strategy';
import { Types } from 'mongoose';

interface UserWithId {
  _id: Types.ObjectId;
  email: string;
  password: string;
  isEmailVerified: boolean;
  role: string;
  passwordResetToken?: string;
  passwordResetTokenExpiry?: Date;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const { password: _, ...result } = user.toObject();
    return result;
  }

  async login(user: any) {
    if (!user.isEmailVerified) {
      throw new UnauthorizedException(
        'Email not verified. Please check your inbox for the verification link or request a new one.'
      );
    }

    const payload: JwtPayload = {
      email: user.email,
      sub: user._id?.toString() || user.id,
      role: user.role,
    };

    // Update last login time
    await this.usersService.updateUser(payload.sub, { lastLoginAt: new Date() });

    return {
      access_token: this.jwtService.sign(payload),
      user: this.usersService.toResponseDto(user),
    };
  }

  async sendVerificationEmail(userId: string): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new BadRequestException('User account not found. Please register again.');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('This email address is already verified. You can proceed to login.');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24); // Token expires in 24 hours

    await this.usersService.updateUser(userId, {
      verificationToken: token,
      verificationTokenExpiry: tokenExpiry,
    });

    await this.mailService.sendVerificationEmail(user.email, token);
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await this.usersService.findByVerificationToken(token);
    if (!user) {
      throw new BadRequestException('Invalid or expired verification link. Please request a new one.');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('This email address is already verified. You can proceed to login.');
    }

    if (!user.verificationTokenExpiry || user.verificationTokenExpiry < new Date()) {
      throw new BadRequestException(
        'Your verification link has expired. Please request a new verification email.'
      );
    }

    await this.usersService.updateUser(user._id.toString(), {
      isEmailVerified: true,
      verificationToken: null,
      verificationTokenExpiry: null,
    });
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.usersService.findOne(email);
    if (!user) {
      // For security reasons, we still return success even if email doesn't exist
      return;
    }

    if (!user.isEmailVerified) {
      throw new BadRequestException(
        'Please verify your email address before requesting a password reset.'
      );
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 1); // Token expires in 1 hour

    await this.usersService.updateUser(user._id.toString(), {
      passwordResetToken: token,
      passwordResetTokenExpiry: tokenExpiry,
    });

    await this.mailService.sendPasswordResetEmail(email, token);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.usersService.findByPasswordResetToken(token);
    if (!user) {
      throw new BadRequestException(
        'Invalid or expired password reset link. Please request a new one.'
      );
    }

    if (!user.passwordResetTokenExpiry || user.passwordResetTokenExpiry < new Date()) {
      throw new BadRequestException(
        'Your password reset link has expired. Please request a new one.'
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await this.usersService.updateUser(user._id.toString(), {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetTokenExpiry: null,
    });
  }

  verifyToken(token: string): JwtPayload {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException(
        'Your session has expired. Please log in again.'
      );
    }
  }
}