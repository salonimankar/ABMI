import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';
import { FaceDetection } from '@mediapipe/face_detection';
import { FaceMesh, Results as FaceMeshResults } from '@mediapipe/face_mesh';
import { RealTimeMetrics } from '../types';

class AnalysisService {
  private poseDetector: poseDetection.PoseDetector | null = null;
  private faceDetector: FaceDetection | null = null;
  private faceMesh: FaceMesh | null = null;
  private isInitialized = false;
  private lastFaceResults: FaceMeshResults | null = null;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Initialize TensorFlow.js and pick the best backend
      try {
        await tf.setBackend('webgl');
      } catch {
        await tf.setBackend('cpu');
      }
      await tf.ready();

      // Initialize Pose Detection
      const detectorConfig = {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        enableSmoothing: true,
      } as any;
      this.poseDetector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        detectorConfig
      );

      // Initialize MediaPipe Face Detection
      this.faceDetector = new FaceDetection({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`;
        }
      });

      this.faceDetector.setOptions({
        selfieMode: false,
        minDetectionConfidence: 0.5,
        model: 'short'
      } as any);

      // Initialize MediaPipe Face Mesh
      this.faceMesh = new FaceMesh({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        }
      });

      this.faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      } as any);

      // Set a single persistent results handler
      this.faceMesh.onResults((results: FaceMeshResults) => {
        this.lastFaceResults = results;
      });

      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing analysis service:', error);
      throw error;
    }
  }

  async analyzePose(videoElement: HTMLVideoElement): Promise<RealTimeMetrics['posture']> {
    if (!this.poseDetector) {
      throw new Error('Pose detector not initialized');
    }

    const poses = await this.poseDetector.estimatePoses(videoElement as any);
    if (!poses.length) {
      throw new Error('No pose detected');
    }

    const pose = poses[0];
    const keypoints = pose.keypoints as any;

    const backStraightness = this.calculateBackStraightness(keypoints);
    const headTilt = this.calculateHeadTilt(keypoints);
    const bodyLean = this.calculateBodyLean(keypoints);
    const stability = this.calculateStability(keypoints);

    return {
      backStraightness,
      headTilt,
      bodyLean,
      stability,
    };
  }

  async analyzeFacialExpressions(videoElement: HTMLVideoElement): Promise<RealTimeMetrics['emotion']> {
    if (!this.faceMesh) {
      throw new Error('Face mesh not initialized');
    }

    // Send current frame and wait for results to be updated by the persistent handler
    await this.faceMesh.send({ image: videoElement as any });
    const results = this.lastFaceResults;

    if (!results?.multiFaceLandmarks || !results.multiFaceLandmarks.length) {
      throw new Error('No face detected');
    }

    const landmarks = results.multiFaceLandmarks[0];

    const emotions = this.analyzeLandmarksForEmotions(landmarks as any);
    const primaryEmotion = Object.entries(emotions)
      .reduce((a, b) => (a[1] > b[1] ? a : b))[0] as any;

    const confidence = (results.multiFaceLandmarks[0] as any).some((point: any) => point.visibility ?? 1 > 0.9) ? 0.95 : 0.7;
    const stability = this.calculateStabilityFromLandmarks(landmarks as any);
    const engagement = this.calculateEngagementFromLandmarks(landmarks as any);

    return {
      primaryEmotion,
      confidence,
      stability,
      engagement,
    };
  }

  async analyzeVoice(audioData: Float32Array): Promise<RealTimeMetrics['voice']> {
    // Basic audio analysis
    const volume = Math.max(...audioData.map(Math.abs));
    const clarity = this.calculateClarity(audioData);
    const speechRate = this.calculateSpeechRate(audioData);
    const tone = this.calculateTone(audioData);
    const confidence = this.calculateVoiceConfidence(audioData);

    return {
      clarity,
      speechRate,
      tone,
      volume,
      confidence,
    };
  }

  private analyzeLandmarksForEmotions(landmarks: any) {
    const emotions = {
      neutral: 0.5,
      happy: 0,
      sad: 0,
      angry: 0,
      surprised: 0
    } as Record<string, number>;

    const leftMouthCorner = landmarks[61];
    const rightMouthCorner = landmarks[291];
    const upperLip = landmarks[0];
    const lowerLip = landmarks[17];

    const mouthCurvature = (leftMouthCorner.y + rightMouthCorner.y) / 2 - upperLip.y;
    
    if (mouthCurvature > 0.1) {
      emotions.happy = 0.8;
      emotions.neutral = 0.2;
    }

    return emotions;
  }

  private calculateStabilityFromLandmarks(_landmarks: any): number {
    return 0.85;
  }

  private calculateEngagementFromLandmarks(_landmarks: any): number {
    return 0.9;
  }

  private calculateBackStraightness(_keypoints: poseDetection.Keypoint[]): number {
    return 85;
  }

  private calculateHeadTilt(_keypoints: poseDetection.Keypoint[]): number {
    return 90;
  }

  private calculateBodyLean(_keypoints: poseDetection.Keypoint[]): number {
    return 88;
  }

  private calculateStability(_keypoints: poseDetection.Keypoint[]): number {
    return 92;
  }

  // Audio analysis methods
  private calculateClarity(audioData: Float32Array): number {
    return 0.8;
  }

  private calculateSpeechRate(audioData: Float32Array): number {
    return 0.75;
  }

  private calculateTone(audioData: Float32Array): number {
    return 0.9;
  }

  private calculateVoiceConfidence(audioData: Float32Array): number {
    return 0.85;
  }
}

export const analysisService = new AnalysisService();