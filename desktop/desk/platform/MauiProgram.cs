using Microsoft.Extensions.Logging;

namespace platform
{
    public static class MauiProgram
    {
        public static MauiApp CreateMauiApp()
        {
            var builder = MauiApp.CreateBuilder();
            builder
                .UseMauiApp<App>()
                .ConfigureFonts(fonts =>
                {
                    fonts.AddFont("Outfit-Medium.ttf", "OutMedium");
                    fonts.AddFont("Outfit-Semibold.ttf", "OutSemibold");
                });

#if DEBUG
    		builder.Logging.AddDebug();
#endif

            return builder.Build();
        }
    }
}
