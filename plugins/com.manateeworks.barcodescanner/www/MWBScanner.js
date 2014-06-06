/*
 
 Version 1.1
 Copyright (c) 2014 Manatee Works. All rights reserved.
 
Changes in 1.1:
 
- Advanced Overlay (MWBsetOverlayMode: function(overlayMode)
 
 You can now choose between Simple Image Overlay and MW Dynamic Overlay, which shows the actual 
 viewfinder, depending on selected barcode types and their respective scanning rectangles;
 
- Orientation parameter (MWBsetInterfaceOrientation: function(interfaceOrientation))
 
 Now there's only a single function for supplying orientation parameters which makes tweaking the 
 controller for changing scanner orientation no longer needed; 
 
- Enable or disable high resolution scanning (MWBenableHiRes: function(enableHiRes))
 
 Added option to choose between high or normal resolution scanning to better match user 
 application requirements;
 
- Flash handling (MWBenableFlash: function(enableFlash))

 Added option to enable or disable the flash toggle button;
 
 
 */


  /**
   * @name Basic return values for API functions
   * @{
   */
  var  MWB_RT_OK =                  	  0;
  var  MWB_RT_FAIL =                	 -1;
  var  MWB_RT_NOT_SUPPORTED =       	 -2;
  var  MWB_RT_BAD_PARAM =            	 -3;
  
  

  /** @brief  Code39 decoder flags value: require checksum check
   */
  var  MWB_CFG_CODE39_REQUIRE_CHECKSUM =  0x2;
  /**/
  
  /** @brief  Code39 decoder flags value: don't require stop symbol - can lead to false results
   */
  var  MWB_CFG_CODE39_DONT_REQUIRE_STOP = 0x4;
  /**/
      
  /** @brief  Code39 decoder flags value: decode full ASCII
   */
  var MWB_CFG_CODE39_EXTENDED_MODE =      0x8;
  /**/
  
  /** @brief  Code93 decoder flags value: decode full ASCII
   */
  var MWB_CFG_CODE93_EXTENDED_MODE =      0x8;
  /**/


  /** @brief  Code25 decoder flags value: require checksum check
  */
  var  MWB_CFG_CODE25_REQ_CHKSUM =        0x1;
 /**/
  
  /** @brief  Codabar decoder flags value: include start/stop symbols in result
  */
  var  MWB_CFG_CODABAR_INCLUDE_STARTSTOP =        0x1;
 /**/

  /** @brief  Global decoder flags value: apply sharpening on input image
   */
  var  MWB_CFG_GLOBAL_HORIZONTAL_SHARPENING =          0x01;
  var  MWB_CFG_GLOBAL_VERTICAL_SHARPENING =            0x02;
  var  MWB_CFG_GLOBAL_SHARPENING =                     0x03;
  
  /** @brief  Global decoder flags value: apply rotation on input image
   */
  var  MWB_CFG_GLOBAL_ROTATE90 =                       0x04;
  
  /**
   * @name Bit mask identifiers for supported decoder types
   * @{ */
  var MWB_CODE_MASK_NONE =             0x00000000;
  var MWB_CODE_MASK_QR =               0x00000001;
  var MWB_CODE_MASK_DM =               0x00000002;
  var MWB_CODE_MASK_RSS =              0x00000004;
  var MWB_CODE_MASK_39 =               0x00000008;
  var MWB_CODE_MASK_EANUPC =           0x00000010;
  var MWB_CODE_MASK_128 = 	           0x00000020;
  var MWB_CODE_MASK_PDF = 	           0x00000040;
  var MWB_CODE_MASK_AZTEC =	           0x00000080;
  var MWB_CODE_MASK_25 =	           0x00000100;
  var MWB_CODE_MASK_93 =               0x00000200;
  var MWB_CODE_MASK_CODABAR =          0x00000400;
  var MWB_CODE_MASK_ALL =              0xffffffff;
  /** @} */
  
  
  /**
   * @name Bit mask identifiers for RSS decoder types
   * @{ */
  var MWB_SUBC_MASK_RSS_14 =           0x00000001;
  var MWB_SUBC_MASK_RSS_LIM =          0x00000004;
  var MWB_SUBC_MASK_RSS_EXP =          0x00000008;
  /** @} */
  
  /**
   * @name Bit mask identifiers for Code 2 of 5 decoder types
   * @{ */
  var MWB_SUBC_MASK_C25_INTERLEAVED =  0x00000001;
  var MWB_SUBC_MASK_C25_STANDARD =     0x00000002;
  /** @} */
  
  /**
   * @name Bit mask identifiers for UPC/EAN decoder types
   * @{ */
  var MWB_SUBC_MASK_EANUPC_EAN_13 =    0x00000001;
  var MWB_SUBC_MASK_EANUPC_EAN_8 =     0x00000002;
  var MWB_SUBC_MASK_EANUPC_UPC_A =     0x00000004;
  var MWB_SUBC_MASK_EANUPC_UPC_E =     0x00000008;
  /** @} */
  
  /**
   * @name Bit mask identifiers for 1D scanning direction 
   * @{ */
  var MWB_SCANDIRECTION_HORIZONTAL =   0x00000001;
  var MWB_SCANDIRECTION_VERTICAL =     0x00000002;
  var MWB_SCANDIRECTION_OMNI =         0x00000004;
  var MWB_SCANDIRECTION_AUTODETECT =   0x00000008;
  /** @} */
  
  var FOUND_NONE = 			0;
  var FOUND_DM = 			1;
  var FOUND_39 = 			2;
  var FOUND_RSS_14 = 		3;
  var FOUND_RSS_14_STACK = 	4;
  var FOUND_RSS_LIM = 		5;
  var FOUND_RSS_EXP = 		6;
  var FOUND_EAN_13 = 		7;
  var FOUND_EAN_8 = 		8;
  var FOUND_UPC_A = 		9;
  var FOUND_UPC_E = 		10;
  var FOUND_128 = 			11;
  var FOUND_PDF = 			12;
  var FOUND_QR = 			13;
  var FOUND_AZTEC= 			14;
  var FOUND_25_INTERLEAVED =15;
  var FOUND_25_STANDARD =   16; 
  var FOUND_93 = 			17;
  var FOUND_CODABAR =		18;
  
  var OrientationPortrait =         'Portrait';
  var OrientationLandscapeLeft =    'LandscapeLeft';
  var OrientationLandscapeRight =   'LandscapeRight';
               
  var OverlayModeNone =    0;
  var OverlayModeMW =      1;
  var OverlayModeImage =   2;
               
  
  var BarcodeScanner = {
	
   /**
    * Init decoder with default params.
    */
	MWBinitDecoder: function(callback)
    {
	    cordova.exec(callback, function(){}, "MWBarcodeScanner", "initDecoder", []);
	},
	  
   /**
    * Call the scanner screen. Result are returned in callback function as:
    * result.code - string representation of barcode result
    * result.type - type of barcode detected or 'Cancel' if scanning is canceled
    * result.bytes - bytes array of raw barcode result
    */
	MWBstartScanning: function(callback)
    {
	 	cordova.exec(callback, function(err) 
	 	{
		 	callback('Error: ' + err);
		 }, "MWBarcodeScanner", "startScanner", []);
  	 },

   /**
    * Sets active or inactive status of decoder types
    *
    * @param[in]       activeCodes             ORed bit flags (MWB_CODE_MASK_...) of decoder types
    *                                          to be activated.
    */
	MWBsetActiveCodes: function(activeCodes)
    {
   	     cordova.exec(function(){}, function(){}, "MWBarcodeScanner", "setActiveCodes", [activeCodes]);
   	},
   	
   /**
    * Set active subcodes for given code group flag.
    * Subcodes under some decoder type are all activated by default.
    *
    * @param[in]       codeMask                Single decoder type/group (MWB_CODE_MASK_...)
    * @param[in]       subMask                 ORed bit flags of requested decoder subtypes (MWB_SUBC_MASK_)
    */
   	MWBsetActiveSubcodes: function(codeMask, activeSubcodes)
    {
   	     cordova.exec(function(){}, function(){}, "MWBarcodeScanner", "setActiveSubcodes", [codeMask, activeSubcodes]);
   	},
   	
   /**
    * MWBsetFlags configures options (if any) for decoder type specified in codeMask.
    * Options are given in  flags as bitwise OR of option bits. Available options depend on selected decoder type.
    *
    * @param[in]   codeMask                Single decoder type (MWB_CODE_MASK_...)
    * @param[in]   flags                   ORed bit mask of selected decoder type options (MWB_FLAG_...)
    */
   	MWBsetFlags: function(codeMask, flags)
    {
   	     cordova.exec(function(){}, function(){}, "MWBarcodeScanner", "setFlags", [codeMask, flags]);
   	},
   	
   /**
    * This function enables some control over scanning lines choice for 1D barcodes. By ORing
    * available bit-masks user can add one or more direction options to scanning lines set.
    * @n           - MWB_SCANDIRECTION_HORIZONTAL - horizontal lines
    * @n           - MWB_SCANDIRECTION_VERTICAL - vertical lines
    * @n           - MWB_SCANDIRECTION_OMNI - omnidirectional lines
    * @n           - MWB_SCANDIRECTION_AUTODETECT - enables BarcodeScanner's
    *                autodetection of barcode direction
    *
    * @param[in]   direction               ORed bit mask of direction modes given with
    *                                      MWB_SCANDIRECTION_... bit-masks
    */
   	MWBsetDirection: function(direction)
    {
   	     cordova.exec(function(){}, function(){}, "MWBarcodeScanner", "setDirection", [direction]);
   	},
   	
   /**
    * Sets rectangular area for barcode scanning with selected single decoder type.
    * After MWBsetScanningRect() call, all subseqent scans will be restricted
    * to this region. If rectangle is not set, whole image is scanned.
    * Also, if width or height is zero, whole image is scanned.
    *
    * Parameters are interpreted as percentage of image dimensions, i.e. ranges are
    * 0 - 100 for all parameters.
    *
    * @param[in]   codeMask            Single decoder type selector (MWB_CODE_MASK_...)
    * @param[in]   left                X coordinate of left edge (percentage)
    * @param[in]   top                 Y coordinate of top edge (percentage)
    * @param[in]   width               Rectangle witdh (x axis) (percentage)
    * @param[in]   height              Rectangle height (y axis) (percentage)
    */
   	MWBsetScanningRect: function(codeMask, left, top, width, height)
    {
   	     cordova.exec(function(){}, function(){}, "MWBarcodeScanner", "setScanningRect", [codeMask, left, top, width, height]);
   	},
      
   /**
    * Barcode detector relies on image processing and geometry inerpolation for
    * extracting optimal data for decoding. Higher effort level involves more processing
    * and intermediate parameter values, thus increasing probability of successful
    * detection with low quality images, but also consuming more CPU time.
    *
    * @param[in]   level                   Effort level - available values are 1, 2, 3, 4 and 5.
    *                                      Levels greater than 3 are not suitable fro real-time decoding
    */
    MWBsetLevel: function(level)
    {
         cordova.exec(function(){}, function(){}, "MWBarcodeScanner", "setLevel", [level]);
    },
         
   /**
    * Sets prefered User Interface orientation of scanner screen
    * Choose one fo the available values:
    * OrientationPortrait
    * OrientationLandscapeLeft
    * OrientationLandscapeRight
    *
    * Default value is OrientationLandscapeLeft
    */
    MWBsetInterfaceOrientation: function(interfaceOrientation)
    {
    cordova.exec(function(){}, function(){}, "MWBarcodeScanner", "setInterfaceOrientation", [interfaceOrientation]);
    },
    
   /**
    * Choose overlay graphics type for scanning screen:
    * OverlayModeNone   - No overlay is displayed
    * OverlayModeMW     - Use MW Dynamic Viewfinder with blinking line (you can customize display options
    *                     in native class by changing defaults)
    * OverlayModeImage  - Show image on top of camera preview
    *
    * Default value is OverlayModeMW
    */
    MWBsetOverlayMode: function(overlayMode)
    {
    cordova.exec(function(){}, function(){}, "MWBarcodeScanner", "setOverlayMode", [overlayMode]);
    },
    
   /**
    * Enable or disable high resolution scanning. It's recommended to enable it when target barcodes
    * are of high density or small footprint. If device doesn't support high resolution param will be ignored
    *
    * Default value is true (enabled)
    */
    MWBenableHiRes: function(enableHiRes)
    {
    cordova.exec(function(){}, function(){}, "MWBarcodeScanner", "enableHiRes", [enableHiRes]);
    },
          
   /**
    * Enable or disable flash toggle button on scanning screen. If device doesn't support flash mode
    * button will be hidden regardles of param
    *
    * Default value is true (enabled)
    */
    MWBenableFlash: function(enableFlash)
    {
    cordova.exec(function(){}, function(){}, "MWBarcodeScanner", "enableFlash", [enableFlash]);
    }
	
  };
  
scanner = {};
  
  scanner.startScanning = function(success, error)
  {
   		//Initialize decoder with default params	
   		BarcodeScanner.MWBinitDecoder(function(){

			//You can set specific params after InitDecoder to optimize the scanner according to your needs
                                      
            //BarcodeScanner.MWBsetInterfaceOrientation(OrientationPortrait);
            //BarcodeScanner.MWBsetOverlayMode(OverlayModeImage);
            //BarcodeScanner.MWBenableHiRes(false);
            //BarcodeScanner.MWBenableFlash(false);

			//BarcodeScanner.MWBsetActiveCodes(MWB_CODE_MASK_39);
			//BarcodeScanner.MWBsetLevel(2);
   			//BarcodeScanner.MWBsetFlags(MWB_CODE_MASK_39, MWB_CFG_CODE39_EXTENDED_MODE);
   			//BarcodeScanner.MWBsetDirection(MWB_SCANDIRECTION_VERTICAL);
   			//BarcodeScanner.MWBsetScanningRect(MWB_CODE_MASK_39, 20,20,60,60);	

			// Call the barcode scanner screen
			 BarcodeScanner.MWBstartScanning(function(result) 
   			 {
                                    
				/*
				 result.code - string representation of barcode result
				 result.type - type of barcode detected
				 result.bytes - bytes array of raw barcode result
				 */
                                        
                if (result.type == 'Cancel'){
                    //Perform some action on scanning canceled if needed
                } else
				if (result && result.code){
            		success(result.code, result.type);
                //navigator.notification.alert(result.code, function(){}, result.type, 'Close');
				}else{
          error();
        }
                        
			 });



		});

        
  }
  
  module.exports = scanner;
  

