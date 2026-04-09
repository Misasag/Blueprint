import { useCallback } from 'react';

interface UseFileAPIParams {
  filePath: string | null;
  source: string;
  loadSource: (source: string, filePath?: string) => void;
  markSaved: (filePath?: string) => void;
}

export function useFileAPI({ filePath, source, loadSource, markSaved }: UseFileAPIParams) {
  const handleOpen = useCallback(async () => {
    if (!window.electronAPI) return;
    try {
      const result = await window.electronAPI.openFile();
      if (!result) return;
      if (!result.success) {
        console.error('ファイルを開けませんでした:', result.error);
        return;
      }
      loadSource(result.content!, result.filePath!);
    } catch (err) {
      console.error('ファイルを開けませんでした:', err);
    }
  }, [loadSource]);

  const handleSave = useCallback(async () => {
    if (!window.electronAPI) return;
    try {
      if (filePath) {
        const result = await window.electronAPI.saveFile(filePath, source);
        if (result.success) {
          markSaved();
        } else {
          console.error('保存に失敗:', result.error);
        }
      } else {
        const result = await window.electronAPI.saveFileAs(source);
        if (!result) return;
        if (result.success && result.filePath) {
          markSaved(result.filePath);
        } else if (!result.success) {
          console.error('保存に失敗:', result.error);
        }
      }
    } catch (err) {
      console.error('保存に失敗:', err);
    }
  }, [filePath, source, markSaved]);

  return { handleOpen, handleSave };
}
