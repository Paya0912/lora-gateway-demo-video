import React from 'react';
import { Composition } from 'remotion';
import { FPS, HEIGHT, WIDTH } from './config';
import { ThesisDemo, getTotalFrames } from './ThesisDemo';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ThesisDemo"
      component={ThesisDemo}
      durationInFrames={getTotalFrames(FPS)}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
};