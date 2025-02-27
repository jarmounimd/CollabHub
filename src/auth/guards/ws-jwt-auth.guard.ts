import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { verify } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    try {
      const client: Socket = context.switchToWs().getClient<Socket>();
      const authToken = client.handshake.headers.authorization?.split(' ')[1];

      if (!authToken) {
        throw new WsException('Missing auth token');
      }

      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      if (!jwtSecret) {
        throw new WsException('JWT_SECRET not configured');
      }

      const decoded = verify(authToken, jwtSecret);
      client.data.user = decoded;

      return true;
    } catch (err) {
      throw new WsException('Invalid auth token');
    }
  }
}
