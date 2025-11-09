/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {Video} from '@google/genai';

export enum AppState {
  IDLE,
  ANALYZING,
  READY,
  PLAYING,
  RESULT,
  ERROR,
}

export enum BetChoice {
  GOAL = 'goal',
  NO_GOAL = 'no_goal',
}

export enum GameResult {
  WIN = 'win',
  LOSE = 'lose',
}

export interface ImageFile {
  file: File;
  base64: string;
}

// FIX: Add missing VideoFile type definition.
export interface VideoFile extends ImageFile {}

// FIX: Add missing VeoModel enum definition.
export enum VeoModel {
  VEO = 'veo-3.1-generate-preview',
  VEO_FAST = 'veo-3.1-fast-generate-preview',
}

// FIX: Add missing AspectRatio enum definition.
export enum AspectRatio {
  LANDSCAPE = '16:9',
  PORTRAIT = '9:16',
}

// FIX: Add missing Resolution enum definition.
export enum Resolution {
  P720 = '720p',
  P1080 = '1080p',
}

// FIX: Add missing GenerationMode enum definition.
export enum GenerationMode {
  TEXT_TO_VIDEO = 'Text to Video',
  FRAMES_TO_VIDEO = 'Frames to Video',
  REFERENCES_TO_VIDEO = 'References to Video',
  EXTEND_VIDEO = 'Extend Video',
}

// FIX: Add missing GenerateVideoParams interface definition.
export interface GenerateVideoParams {
  prompt: string;
  model: VeoModel;
  aspectRatio: AspectRatio;
  resolution: Resolution;
  mode: GenerationMode;
  startFrame: ImageFile | null;
  endFrame: ImageFile | null;
  referenceImages: ImageFile[];
  styleImage: ImageFile | null;
  inputVideo: VideoFile | null;
  inputVideoObject: Video | null;
  isLooping: boolean;
}
