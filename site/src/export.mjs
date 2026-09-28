import { zipSync, strToU8 } from 'fflate';
import { download } from './helpers.mjs';

/** Pure project construction, shared by the download UI and validation tests. */
export function createProjectFiles(lesson, code) {
  const global = {
    sdk: { version: '10.0.401', rollForward: 'latestPatch' },
    'msbuild-sdks': { 'Uno.Sdk': '6.7.30' }
  };
  const project = `<Project Sdk="Uno.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFrameworks>net10.0-browserwasm</TargetFrameworks>
    <UnoSingleProject>true</UnoSingleProject>
    <UnoFeatures>NativeRenderer</UnoFeatures>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <PublishTrimmed>false</PublishTrimmed>
    <RunAOTCompilation>false</RunAOTCompilation>
    <JsonSerializerIsReflectionEnabledByDefault>true</JsonSerializerIsReflectionEnabledByDefault>
  </PropertyGroup>
</Project>
`;
  const app = `using System.Reflection;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Markup;

public static class Program
{
    private static App? app;
    public static void Main(string[] args)
    {
        Assembly.Load("Uno.UI.Runtime.WebAssembly");
        Application.Start(_ => app = new App());
    }
}

public sealed class App : Application
{
    private Window? window;
    protected override void OnLaunched(LaunchActivatedEventArgs args)
    {
        Resources.MergedDictionaries.Add(new XamlControlsResources());
        window = new Window
        {
            Content = ${lesson.language === 'xml' ? '(UIElement)XamlReader.Load(LessonMarkup.Source)' : 'Lesson.Build()'}
        };
        window.Activate();
    }
}
`;
  const files = {
    'global.json': JSON.stringify(global, null, 2),
    'LessonApp.csproj': project,
    'Program.cs': app,
    'WasmScripts/AppManifest.js': 'var UnoAppManifest = { displayName: "LearnUno Lesson", splashScreenColor: "transparent" };\n',
    'README.md': `# ${lesson.title}\n\nExported from LearnUno.\n\nInstall .NET 10 and the Uno prerequisites for your environment.\n\n\`\`\`sh\ndotnet workload install wasm-tools\ndotnet run -f net10.0-browserwasm\ndotnet publish -f net10.0-browserwasm -c Release\n\`\`\`\n\nThis is a browser-only lesson project. XAML exports use runtime XamlReader, matching the playground. Reflection paths are preserved intentionally. Move markup into a compiled Page to use x:Bind or x:Class. Additional project-only examples may require packages and supporting members. This standalone app uses the browser's normal storage policy; the online playground instead uses per-frame ephemeral settings.\n\n## Exercise\n${lesson.challenge}\n\n## Independent work\n${lesson.transfer}\n`
  };
  if (lesson.language === 'xml') {
    files['Lesson.xaml.txt'] = code;
    files['LessonMarkup.cs'] = 'public static class LessonMarkup { public const string Source = @"' + code.replaceAll('"', '""') + '"; }\n';
  } else {
    files['Lesson.cs'] = code;
  }
  if (lesson.projectCode) files['ProjectExample.txt'] = lesson.projectCode + '\n\n' + lesson.projectNote;
  return files;
}

export function exportProject(lesson, code) {
  const files = createProjectFiles(lesson, code);
  const bytes = zipSync(Object.fromEntries(Object.entries(files).map(([name, text]) => [name, strToU8(text)])), { level: 6 });
  download('LearnUno-' + lesson.id + '.zip', new Blob([bytes], { type: 'application/zip' }));
}
