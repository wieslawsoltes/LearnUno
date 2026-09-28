using System.Reflection;
using Microsoft.UI.Xaml;

namespace LearnUnoRunner;

/// <summary>Completion metadata comes from the loaded Uno assembly, not a hard-coded list of controls.</summary>
public static class XamlSchema
{
    private static object? _schema;
    public static object Describe() => _schema ??= new
    {
        engine = "Uno reflection metadata",
        types = typeof(UIElement).Assembly.GetExportedTypes()
            .Where(type => type.IsPublic && !type.IsGenericType && type.Namespace?.StartsWith("Microsoft.UI.Xaml", StringComparison.Ordinal) == true)
            .OrderBy(type => type.Name)
            .Select(type => new
            {
                name = type.Name, fullName = type.FullName,
                properties = type.GetProperties(BindingFlags.Instance | BindingFlags.Public)
                    .Where(property => property.GetIndexParameters().Length == 0)
                    .GroupBy(property => property.Name).Select(group => group.First())
                    .Select(property => new { name = property.Name, type = property.PropertyType.Name, writable = property.CanWrite,
                        values = property.PropertyType.IsEnum ? Enum.GetNames(property.PropertyType) : property.PropertyType == typeof(bool) ? new[] { "True", "False" } : Array.Empty<string>() }).ToArray(),
                events = type.GetEvents(BindingFlags.Public | BindingFlags.Instance).Select(e => e.Name).ToArray()
            }).ToArray()
    };
}
