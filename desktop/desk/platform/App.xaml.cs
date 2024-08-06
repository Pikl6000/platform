using Microsoft.Maui.Controls;

namespace platform
{

    public partial class App : Application
    {
        public App()
        {
            InitializeComponent();
            MainPage = new AppShell();
        }

        protected override void OnHandlerChanged()
        {
            base.OnHandlerChanged();

            if (Handler?.PlatformView is Microsoft.UI.Xaml.Window window)
            {
                window.MinWidth = 500;
                window.MinHeight = 400;
            }
        }
    }
}
