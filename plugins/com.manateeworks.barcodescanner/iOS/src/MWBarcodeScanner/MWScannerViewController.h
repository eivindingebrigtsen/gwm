/*
 * Copyright (C) 2012  Manatee Works, Inc.
 *
 */

#import <UIKit/UIKit.h>
#import <AVFoundation/AVFoundation.h>
#import <CoreGraphics/CoreGraphics.h>
#import <CoreVideo/CoreVideo.h>
#import <CoreMedia/CoreMedia.h>

#define OM_MW       1
#define OM_IMAGE    2

@protocol ScanningFinishedDelegate <NSObject>
    - (void)scanningFinished:(NSString *)result withType: (NSString *) lastFormat andRawResult: (NSData *) rawResult;
@end


@interface DecoderResult : NSObject {
	BOOL succeeded;
	NSString *result;
    NSString *format;
    NSData *rawResult;
}

@property (nonatomic, assign) BOOL succeeded;
@property (nonatomic, retain) NSString *result;
@property (nonatomic, retain) NSString *format;
@property (nonatomic, retain) NSData *rawResult;


+(DecoderResult *)createSuccess:(NSString *)result format: (NSString *) format rawResult: (NSData *) rawResult;
+(DecoderResult *)createFailure;

@end


typedef enum eMainScreenState {
	NORMAL,
	LAUNCHING_CAMERA,
	CAMERA,
	CAMERA_DECODING,
	DECODE_DISPLAY,
	CANCELLING
} MainScreenState;


@interface MWScannerViewController : UIViewController<AVCaptureVideoDataOutputSampleBufferDelegate,UINavigationControllerDelegate, UIAlertViewDelegate>{
    
    IBOutlet UIImageView *cameraOverlay;
    IBOutlet UIButton *closeButton;
    IBOutlet UIButton *flashButton;
    
}



@property (nonatomic, assign) MainScreenState state;
@property (nonatomic, retain) AVCaptureSession *captureSession;
@property (nonatomic, retain) AVCaptureVideoPreviewLayer *prevLayer;
@property (nonatomic, retain) AVCaptureDevice *device;
@property (nonatomic, retain) NSTimer *focusTimer;
@property (nonatomic, retain) id <ScanningFinishedDelegate> delegate;
@property (nonatomic, retain) UIButton *flashButton;


- (IBAction)doClose:(id)sender;
+ (void) initDecoder;
+ (void) setInterfaceOrientation: (UIInterfaceOrientationMask) interfaceOrientation;
+ (void) enableHiRes: (BOOL) hiRes;
+ (void) enableFlash: (BOOL) flash;
+ (void) setOverlayMode: (int) overlayMode;
- (void)revertToNormal;
- (void)decodeResultNotification: (NSNotification *)notification;
- (void)initCapture;
- (void) startScanning;
- (void) stopScanning;
- (void) toggleTorch;

@end