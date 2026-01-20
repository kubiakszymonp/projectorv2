import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainMenu } from '@/views/MainMenu';
import { FilesExplorer } from '@/views/FilesExplorer';
import { ScreenControl } from '@/views/ScreenControl';
import { Settings } from '@/views/Settings';
import { Navbar } from '@/components/ui/navbar';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/screen" element={<ScreenControl />} />
        <Route path="/files/texts" element={<FilesExplorer />} />
        <Route path="/files/media" element={<FilesExplorer />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
