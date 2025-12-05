package com.example.app;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

	private static final int REQUEST_RECORD_AUDIO = 1001;
	private static final String TAG = "MainActivity";

	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);

		// Solicitar permiso de micrófono en tiempo de ejecución si no está concedido
		if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO)
				!= PackageManager.PERMISSION_GRANTED) {
			ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.RECORD_AUDIO}, REQUEST_RECORD_AUDIO);
		}

		// Permitir que el WebView conceda permisos como getUserMedia (micrófono/cámara)
		try {
			if (this.bridge != null && this.bridge.getWebView() != null) {
				// Log Android API level y user agent / settings básicos
				Log.d(TAG, "Android SDK_INT=" + Build.VERSION.SDK_INT);
				try {
					WebSettings ws = this.bridge.getWebView().getSettings();
					ws.setMediaPlaybackRequiresUserGesture(false);
					ws.setAllowFileAccess(true);
					ws.setAllowContentAccess(true);
					ws.setDomStorageEnabled(true);
					if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
						ws.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
					}
					Log.d(TAG, "WebView settings applied: mediaPlaybackRequiresUserGesture=false, domStorage=true");
				} catch (Exception e) {
					Log.w(TAG, "Could not update WebView settings", e);
				}
				this.bridge.getWebView().setWebChromeClient(new WebChromeClient() {
					@Override
					public void onPermissionRequest(final PermissionRequest request) {
						Log.d(TAG, "onPermissionRequest: resources=" + java.util.Arrays.toString(request.getResources()));
						// Conceder todas las recursos solicitados (micrófono/cámara)
						try {
							request.grant(request.getResources());
							Log.d(TAG, "PermissionRequest granted");
						} catch (Exception e) {
							Log.e(TAG, "Error granting PermissionRequest", e);
						}
					}
				});
			}
		} catch (Exception e) {
			// Si algo falla, no bloqueamos la app; logueamos para depuración
			Log.e(TAG, "Error setting WebChromeClient or requesting permissions", e);
		}
	}

	@Override
	public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
		super.onRequestPermissionsResult(requestCode, permissions, grantResults);
		if (requestCode == REQUEST_RECORD_AUDIO) {
			if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
				Log.d(TAG, "RECORD_AUDIO permission granted");
			} else {
				Log.w(TAG, "RECORD_AUDIO permission denied");
			}
		}
	}
}
