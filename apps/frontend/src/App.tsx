import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainMenu } from '@/views/MainMenu';
import { FilesExplorer } from '@/views/FilesExplorer';
import { MediaExplorer } from '@/views/MediaExplorer';
import { ScreenControl } from '@/views/ScreenControl';
import { Settings } from '@/views/Settings';
import { SongCatalog } from '@/views/SongCatalog';
import { ScenarioEditor } from '@/views/ScenarioEditor';
import { Navbar } from '@/components/ui/navbar';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/screen" element={<ScreenControl />} />
        <Route path="/scenarios" element={<ScenarioEditor />} />
        <Route path="/songs" element={<SongCatalog />} />
        <Route path="/media" element={<MediaExplorer />} />
        <Route path="/files" element={<FilesExplorer />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
