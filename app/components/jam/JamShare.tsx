"use client";

import { useState } from 'react';
import QRCode from 'qrcode';
import toast from 'react-hot-toast';
import { useJamCode } from '../../lib/hooks/useJamCode';

interface JamShareProps {
  jamId: string;
  showJamCode?: boolean;
}

export const JamShare = ({ jamId, showJamCode = true }: JamShareProps) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [showQR, setShowQR] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { generateCode, generateUrl } = useJamCode();
  
  const jamCode = generateCode(jamId);
  const shareUrl = generateUrl(jamId);

  const generateQRCode = async () => {
    if (qrCodeDataUrl) {
      setShowQR(true);
      return;
    }

    setIsGenerating(true);
    try {
      const qrDataUrl = await QRCode.toDataURL(shareUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeDataUrl(qrDataUrl);
      setShowQR(true);
      toast.success('QR Code generated!');
    } catch (error) {
      toast.error('Failed to generate QR code');
      console.error('QR Code generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Jam link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const copyJamCode = async () => {
    try {
      await navigator.clipboard.writeText(jamCode);
      toast.success('Jam code copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy jam code');
    }
  };

  const downloadQR = () => {
    if (!qrCodeDataUrl) return;
    
    const link = document.createElement('a');
    link.download = `oneamp-jam-${jamCode}.png`;
    link.href = qrCodeDataUrl;
    link.click();
    toast.success('QR Code downloaded!');
  };

  const hideSharing = () => {
    setShowQR(false);
  };

  return (
    <div className="space-y-4">
      {/* Main sharing button */}
      <button
        onClick={generateQRCode}
        disabled={isGenerating}
        className="w-full bg-black hover:opacity-85 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Generating...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 16h4.01M4 4h4.01M4 16h4.01" />
            </svg>
            Share Jam
          </>
        )}
      </button>

      {/* QR Code Display with all sharing options */}
      {showQR && qrCodeDataUrl && (
        <div className="bg-white p-4 rounded-lg border shadow-sm space-y-3">
          <div className="text-center">
            <img
              src={qrCodeDataUrl}
              alt="QR Code for jam"
              className="mx-auto rounded-lg"
            />
            <p className="text-sm text-gray-600 mt-2">
              Scan to join the jam
            </p>
            <div className="mt-3 p-3 bg-gray-100 rounded-lg border">
              <p className="text-xs text-gray-500 mb-1">Or use code:</p>
              <div className="text-2xl font-mono font-bold text-gray-800 tracking-wider">
                {jamCode}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={copyUrl}
              className="bg-slate-50 hover:bg-gray-200 text-gray-700 py-2 px-2 rounded text-xs transition-colors"
            >
              Copy Link
            </button>
            <button
              onClick={copyJamCode}
              className="bg-slate-50 hover:bg-gray-200 text-gray-700 py-2 px-2 rounded text-xs font-medium transition-colors"
            >
              Copy Code
            </button>
            <button
              onClick={downloadQR}
              className="bg-slate-50 hover:bg-gray-200 text-gray-800 py-2 px-2 rounded text-xs transition-colors"
            >
              Download
            </button>
          </div>
          
          <button
            onClick={hideSharing}
            className="w-full text-gray-500 hover:text-gray-700 py-1 text-sm transition-colors"
          >
            Hide
          </button>
        </div>
      )}
    </div>
  );
};

export const handleShare = async (jamId: string) => {
  const shareUrl = `${window.location.origin}/creator/${jamId}`;
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'OneAmp Jam',
        text: 'Check out this awesome music jam!',
        url: shareUrl,
      });
    } catch (error) {
      console.log('Sharing cancelled or failed: ' + error);
      await copyToClipboard(shareUrl);
    }
  } else {
    await copyToClipboard(shareUrl);
  }
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('Jam link copied to clipboard!');
  } catch (error) {
    toast.error('Failed to copy to clipboard: '+ error);
    prompt('Copy this link to share:', text);
  }
};