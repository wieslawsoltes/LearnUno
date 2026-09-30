using System.Globalization;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Automation;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Controls.Primitives;
using Microsoft.UI.Xaml.Media;

namespace LearnUnoRunner;

/// <summary>
/// Bounded, read-only inspection of actual Uno controls. It never invokes input
/// handlers or changes UI state. Native DOM accessibility is a separate contract.
/// </summary>
public static class RuntimeInspector
{
    public static object Capture()
    {
        const int maximumNodes = 2048;
        var root = App.Surface.XamlRoot;
        var queue = new Queue<(DependencyObject Node, bool Visible)>();
        queue.Enqueue((root?.Content ?? App.Surface, true));
        var openPopupCount = 0;
        if (root is not null)
        {
            foreach (var popup in VisualTreeHelper.GetOpenPopupsForXamlRoot(root))
            {
                if (!popup.IsOpen) continue;
                openPopupCount++;
                // Popup content lives in the popup visual root. It is not
                // necessarily returned as a visual child of the Popup object.
                // Seed the actual Child explicitly; the visited set deduplicates
                // it if a renderer also exposes it through normal traversal.
                if (popup.Child is UIElement child)
                    queue.Enqueue((child, true));
            }
        }
        var seen = new HashSet<DependencyObject>();
        var controls = new List<ControlSnapshot>();
        while (queue.Count != 0 && seen.Count < maximumNodes)
        {
            var (node, ancestorVisible) = queue.Dequeue();
            if (!seen.Add(node)) continue;
            var visible = ancestorVisible && (node is not UIElement element || element.Visibility == Visibility.Visible);
            if (node is Control control)
            {
                var content = control is ContentControl contentControl ? contentControl.Content as string : null;
                controls.Add(new ControlSnapshot(
                    control.Handle.ToInt64().ToString(CultureInfo.InvariantCulture),
                    control.GetType().FullName ?? control.GetType().Name,
                    Limit(AutomationProperties.GetName(control)),
                    Limit(content ?? (control is TextBox input ? input.Text : "")),
                    control.IsEnabled,
                    visible && control.ActualWidth > 0 && control.ActualHeight > 0,
                    control is ButtonBase));
            }
            for (var index = 0; index < VisualTreeHelper.GetChildrenCount(node); index++)
                queue.Enqueue((VisualTreeHelper.GetChild(node, index), visible));
        }
        return new { controls, visited = seen.Count, truncated = queue.Count != 0, openPopupCount };
    }

    private static string Limit(string? value) => value is null ? "" : value[..Math.Min(value.Length, 512)];
    public sealed record ControlSnapshot(string Handle, string Type, string Name, string Text, bool IsEnabled, bool IsVisible, bool IsButton);
}
