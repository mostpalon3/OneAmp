import { useState, useCallback } from 'react';
import { generateJamUrl, isValidJamCode, jamCodeToUuid, uuidToJamCode } from '../jamCode';


interface UseJamCodeReturn {
  generateCode: (uuid: string) => string;
  joinJam: (code: string, availableJams: string[]) => string | null;
  isValidCode: (code: string) => boolean;
  generateUrl: (uuid: string) => string;
}

export function useJamCode(): UseJamCodeReturn {
  const generateCode = useCallback((uuid: string): string => {
    return uuidToJamCode(uuid);
  }, []);
  
  const joinJam = useCallback((code: string, availableJams: string[]): string | null => {
    if (!isValidJamCode(code)) return null;
    
    const uuid = jamCodeToUuid(code, availableJams);
    return uuid ? generateJamUrl(uuid) : null;
  }, []);
  
  const isValidCode = useCallback((code: string): boolean => {
    return isValidJamCode(code);
  }, []);
  
  const generateUrl = useCallback((uuid: string): string => {
    return generateJamUrl(uuid);
  }, []);
  
  return { generateCode, joinJam, isValidCode, generateUrl };
}