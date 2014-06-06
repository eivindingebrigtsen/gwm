//
//  CDVMWBarcodeScanner.h
//  CameraDemo
//
//  Created by vladimir zivkovic on 5/8/13.
//
//

#import "MWScannerViewController.h"
#import <Cordova/CDV.h>

@interface CDVMWBarcodeScanner : CDVPlugin <ScanningFinishedDelegate>


- (void)initDecoder:(CDVInvokedUrlCommand*)command;
- (void)startScanner:(CDVInvokedUrlCommand*)command;
- (void)setActiveCodes:(CDVInvokedUrlCommand*)command;
- (void)setActiveSubcodes:(CDVInvokedUrlCommand*)command;
- (void)setFlags:(CDVInvokedUrlCommand*)command;
- (void)setDirection:(CDVInvokedUrlCommand*)command;
- (void)setScanningRect:(CDVInvokedUrlCommand*)command;
- (void)setLevel:(CDVInvokedUrlCommand*)command;
    
- (void)setInterfaceOrientation:(CDVInvokedUrlCommand*)command;
- (void)setOverlayMode:(CDVInvokedUrlCommand*)command;
- (void)enableHiRes:(CDVInvokedUrlCommand*)command;
- (void)enableFlash:(CDVInvokedUrlCommand*)command;

@end

