package com.manateeworks;
import com.gelatowave.mobile.R;
import java.io.IOException;
import java.io.UnsupportedEncodingException;

import com.manateeworks.camera.CameraManager;


import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.content.res.Configuration;
import android.graphics.Rect;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.view.KeyEvent;
import android.view.SurfaceHolder;
import android.view.SurfaceView;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.Toast;

public class ScannerActivity extends Activity implements SurfaceHolder.Callback{
	
	
	public static final int OM_MW = 1;
	public static final int OM_IMAGE = 2;
   
    private Handler handler;
    public static final int MSG_DECODE = 1;
    public static final int MSG_AUTOFOCUS = 2;
    public static final int MSG_DECODE_SUCCESS = 3;
    public static final int MSG_DECODE_FAILED = 4;
    
    private byte[] lastResult;
    private boolean hasSurface;

    public static int param_Orientation = ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE;
    public static boolean param_EnableHiRes = true;
    public static boolean param_EnableFlash = true;
    public static int param_OverlayMode = OM_MW;
    
    private ImageView overlayImage;
    private ImageButton buttonFlash;
    
    boolean flashOn = false;
	
	
	 @Override
	    public void onCreate(Bundle savedInstanceState)
	    {
	        super.onCreate(savedInstanceState);
	        setRequestedOrientation(param_Orientation);
	        setContentView(R.layout.scanner);
	        
	        overlayImage = (ImageView) findViewById(R.id.overlayImage);
	        
	        buttonFlash = (ImageButton) findViewById(R.id.flashButton);
			buttonFlash.setOnClickListener(new OnClickListener() {
				@Override
				public void onClick(View v) {
					toggleFlash();
					
					
				}
			});
	        
	        CameraManager.init(getApplication());
	        
	    }
	 
	 
	 @Override
	    protected void onResume()
	    {
	        super.onResume();

	        SurfaceView surfaceView = (SurfaceView) findViewById(R.id.preview_view);
	        SurfaceHolder surfaceHolder = surfaceView.getHolder();
	        
	        if ((param_OverlayMode & OM_MW) > 0){
	        	MWOverlay.addOverlay(this, surfaceView);
	        }
	        
	        
	        
	        if ((param_OverlayMode & OM_IMAGE) > 0){
	        	overlayImage.setVisibility(View.VISIBLE);	
	        } else {
	        	overlayImage.setVisibility(View.GONE);
	        }
	        
	        if (hasSurface)
	        {
	            // The activity was paused but not stopped, so the surface still
	            // exists. Therefore
	            // surfaceCreated() won't be called, so init the camera here.
	            initCamera(surfaceHolder);
	        }
	        else
	        {
	            // Install the callback and wait for surfaceCreated() to init the
	            // camera.
	            surfaceHolder.addCallback(this);
	            surfaceHolder.setType(SurfaceHolder.SURFACE_TYPE_PUSH_BUFFERS);
	        }

	      
	        int ver = BarcodeScanner.MWBgetLibVersion();
	        int v1 = (ver >> 16);
	        int v2 = (ver >> 8) & 0xff;
	        int v3 = (ver & 0xff);
	        String libVersion = "Lib version: " + String.valueOf(v1)+"."+String.valueOf(v2)+"."+String.valueOf(v3);
	        Toast.makeText(this, libVersion, Toast.LENGTH_LONG).show();
	        
	    }
	 
	 @Override
	    protected void onPause()
	    {
	        super.onPause();
	        flashOn = false;
	        updateFlash();
	        if ((param_OverlayMode & OM_MW) > 0){
	        	MWOverlay.removeOverlay();
	        }
	        if (handler != null)
	        {
	        	CameraManager.get().stopPreview();
	            handler = null;
	        }
	        CameraManager.get().closeDriver();

	    }
	 
	    private void toggleFlash() {
			flashOn = !flashOn;
			updateFlash();
		}

		private void updateFlash() {

			if (!CameraManager.get().isTorchAvailable() || !param_EnableFlash) {
				buttonFlash.setVisibility(View.GONE);
				return;

			} else {
				buttonFlash.setVisibility(View.VISIBLE);
			}

			if (flashOn) {
				buttonFlash.setImageResource(R.drawable.flashbuttonon);
			} else {
				buttonFlash.setImageResource(R.drawable.flashbuttonoff);
			}

			CameraManager.get().setTorch(flashOn);

			buttonFlash.postInvalidate();

		}

	@Override
	public void surfaceChanged(SurfaceHolder holder, int format, int width, int height) {
		 if (!hasSurface)
	        {
	            hasSurface = true;
	            initCamera(holder);
	        }
		
	}


	@Override
	public void surfaceCreated(SurfaceHolder holder) {
		
		
	}


	@Override
	public void surfaceDestroyed(SurfaceHolder holder) {
		
		 hasSurface = false;
		
	}
	
	
	 
	
	 private void initCamera(SurfaceHolder surfaceHolder)
	    {
	        try
	        {
	            // Select desired camera resoloution. Not all devices supports all resolutions, closest available will be chosen
	            // If not selected, closest match to screen resolution will be chosen
	            // High resolutions will slow down scanning proccess on slower devices
	            
	        	if (param_EnableHiRes){
	        		CameraManager.setDesiredPreviewSize(1280, 720);
	        	} else {
	        		CameraManager.setDesiredPreviewSize(800, 480);
	        	}
	            
	            CameraManager.get().openDriver(surfaceHolder, (getResources().getConfiguration().orientation == Configuration.ORIENTATION_PORTRAIT));
	        }
	        catch (IOException ioe)
	        {
	            displayFrameworkBugMessageAndExit();
	            return;
	        }
	        catch (RuntimeException e)
	        {
	            // Barcode Scanner has seen crashes in the wild of this variety:
	            // java.?lang.?RuntimeException: Fail to connect to camera service
	            displayFrameworkBugMessageAndExit();
	            return;
	        }
	        if (handler == null)
	        {
	            handler = new Handler(new Handler.Callback() {
					
					@Override
					public boolean handleMessage(Message msg) {
						
						switch (msg.what) {
						case MSG_AUTOFOCUS:
							CameraManager.get().requestAutoFocus(handler, MSG_AUTOFOCUS);
							break;
						case MSG_DECODE:
							decode((byte[]) msg.obj, msg.arg1, msg.arg2);
							break;
						case MSG_DECODE_FAILED:
							CameraManager.get().requestPreviewFrame(handler, MSG_DECODE);
							break;
						case MSG_DECODE_SUCCESS:
							handleDecode((byte[]) msg.obj);
							break;

						default:
							break;
						}
						
						return false;
					}
				});
	        }
	        
	        startScanning();
	        
	        flashOn = false;
			updateFlash();		
				
	    }
	 
	 
	 private void displayFrameworkBugMessageAndExit()
	    {
	        AlertDialog.Builder builder = new AlertDialog.Builder(this);
	        builder.setTitle(getString(R.string.app_name));
	        builder.setMessage("Camera error");
	        builder.setPositiveButton("OK", new DialogInterface.OnClickListener()
	        {
	            public void onClick(DialogInterface dialogInterface, int i)
	            {
	                finish();
	            }
	        });
	        builder.show();
	    }
	 
	 private void startScanning() {
		 CameraManager.get().startPreview();
		 CameraManager.get().requestPreviewFrame(handler, MSG_DECODE);
         CameraManager.get().requestAutoFocus(handler, MSG_AUTOFOCUS);
	 }
	 
	 
	 private void decode(byte[] data, int width, int height) {

		  //Check for barcode inside buffer
	        byte[] rawResult = BarcodeScanner.MWBscanGrayscaleImage(data, width,height);
	        
	        //ignore results less than 4 characters - probably false detection
	        if (rawResult != null && rawResult.length > 4 || (rawResult != null && (rawResult.length > 0 && 
	        		BarcodeScanner.MWBgetLastType() != BarcodeScanner.FOUND_39 && 
	        		BarcodeScanner.MWBgetLastType() != BarcodeScanner.FOUND_25_INTERLEAVED && 
	        		BarcodeScanner.MWBgetLastType() != BarcodeScanner.FOUND_25_STANDARD)))
	        {
	        	if (handler != null){
	        		Message message = Message.obtain(handler, MSG_DECODE_SUCCESS, rawResult);
	        		message.sendToTarget();
	        	}
	        }
	        else
	        {
	            if (handler != null){
	            	Message message = Message.obtain(handler, MSG_DECODE_FAILED);
	            	message.sendToTarget();
	            }
	        }
	    }


	 public void handleDecode(byte[] rawResult)
	    {
	      
	        lastResult = rawResult;
	        String s = "";
	        
	        try {
				s = new String(rawResult, "UTF-8");
			} catch (UnsupportedEncodingException e) {
				
				s = "";
				for (int i = 0; i < rawResult.length; i++)
			            s = s + (char) rawResult[i];	
				e.printStackTrace();
			}
	        
	        int bcType = BarcodeScanner.MWBgetLastType();
	        String typeName="";
	        switch (bcType) {
	            case BarcodeScanner.FOUND_25_INTERLEAVED: typeName = "Code 25";break;
	            case BarcodeScanner.FOUND_25_STANDARD: typeName = "Code 25 Standard";break;
	            case BarcodeScanner.FOUND_128: typeName = "Code 128";break;
	            case BarcodeScanner.FOUND_39: typeName = "Code 39";break;
	            case BarcodeScanner.FOUND_93: typeName = "Code 93";break;
	            case BarcodeScanner.FOUND_AZTEC: typeName = "AZTEC";break;
	            case BarcodeScanner.FOUND_DM: typeName = "Datamatrix";break;
	            case BarcodeScanner.FOUND_EAN_13: typeName = "EAN 13";break;
	            case BarcodeScanner.FOUND_EAN_8: typeName = "EAN 8";break;
	            case BarcodeScanner.FOUND_NONE: typeName = "None";break;
	            case BarcodeScanner.FOUND_RSS_14: typeName = "Databar 14";break;
	            case BarcodeScanner.FOUND_RSS_14_STACK: typeName = "Databar 14 Stacked";break;
	            case BarcodeScanner.FOUND_RSS_EXP: typeName = "Databar Expanded";break;
	            case BarcodeScanner.FOUND_RSS_LIM: typeName = "Databar Limited";break;
	            case BarcodeScanner.FOUND_UPC_A: typeName = "UPC A";break;
	            case BarcodeScanner.FOUND_UPC_E: typeName = "UPC E";break;
	            case BarcodeScanner.FOUND_PDF: typeName = "PDF417";break;
	            case BarcodeScanner.FOUND_QR: typeName = "QR";break;
	            case BarcodeScanner.FOUND_CODABAR: typeName = "Codabar";break;
	        }
	        
	        Intent data = new Intent();
			data.putExtra("code", s);
			data.putExtra("type", typeName);
			data.putExtra("bytes", rawResult);
			setResult(1, data);
			finish();
	     
	    }
	 
	 
	
	 
}
