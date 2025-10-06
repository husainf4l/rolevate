
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UserService } from '../user/user.service';
import { CandidateService } from '../candidate/candidate.service';

// Validate JWT secret is provided
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET environment variable is required but not provided');
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    private readonly candidateService: CandidateService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const token = request?.cookies?.access_token;
          return token;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(), // Fallback to Bearer token
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtSecret!,
    });
    // JWT Strategy initialized
  }

  async validate(payload: any) {
    // Validating JWT payload

    // Fetch user and candidate profile if userType is CANDIDATE
    let candidateProfileId: string | undefined = undefined;
    let companyId: string | undefined = undefined;
    
    if (payload.userType === 'CANDIDATE') {
      try {
        const profile = await this.candidateService.findProfileByUserId(payload.sub);
        if (profile) {
          candidateProfileId = profile.id;
        }
      } catch (_e) {
        // Error fetching candidate profile
      }
    } else if (payload.userType === 'COMPANY') {
      try {
        const user = await this.userService.findById(payload.sub);
        if (user && user.companyId) {
          companyId = user.companyId;
        }
      } catch (_e) {
        // Error fetching company info
      }
    }

    const result = {
      id: payload.sub,
      userId: payload.sub,
      email: payload.email,
      userType: payload.userType,
      candidateProfileId,
      companyId,
    };
    // JWT validation completed
    return result;
  }
}
