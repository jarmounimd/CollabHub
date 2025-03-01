import { Controller, Post, Body, Res, HttpStatus, UseGuards, Get, Request, UnauthorizedException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { UsersService } from '../../users/services/users.service';
import { EmailDto } from '../dto/email.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      // Check if user already exists
      const existingUser = await this.usersService.findOne(createUserDto.email);
      if (existingUser) {
        throw new BadRequestException('User with this email already exists');
      }

      // Create new user
      const user = await this.usersService.create(createUserDto);
      
      // Send verification email
      try {
        await this.authService.sendVerificationEmail(user._id.toString());
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        // Don't throw here, just log the error
      }

      return {
        message: 'Registration successful. Please check your email to verify your account.',
        userId: user._id
      };
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Registration failed. Please try again.'
      );
    }
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return this.usersService.toResponseDto(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('refresh')
  async refresh(@Request() req) {
    const user = await this.usersService.findById(req.user.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.authService.login(user);
  }

  @Post('verify-email')
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    await this.authService.verifyEmail(verifyEmailDto.token);
    return { message: 'Email verified successfully. You can now log in.' };
  }

  @Post('resend-verification')
  async resendVerification(@Body() emailDto: EmailDto) {
    const user = await this.usersService.findOne(emailDto.email);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    if (user.isEmailVerified) {
      throw new BadRequestException('Email already verified');
    }
    await this.authService.sendVerificationEmail(user._id.toString());
    return { message: 'Verification email sent. Please check your inbox.' };
  }

  @Post('forgot-password')
  async forgotPassword(@Body() emailDto: EmailDto) {
    await this.authService.requestPasswordReset(emailDto.email);
    return { message: 'If your email is registered, you will receive password reset instructions.' };
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.newPassword);
    return { message: 'Password reset successful. You can now log in with your new password.' };
  }
}