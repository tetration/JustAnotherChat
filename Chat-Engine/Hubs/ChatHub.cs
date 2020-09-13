using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Collections.Concurrent;
using System.Threading.Tasks;

namespace Chat_Engine.Hubs
{
    public class ChatHub : Hub
    {
        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }

        public async Task Connected(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }
    }
        /*public class ImagesMessageHub : Hub
        {
            public Task ImageMessage(ImageMessage file)
            {
                return Clients.All.SendAsync("ImageMessage", file);
            }
        }

        public class ItemHub : Hub
        {
            public void GetByteArray(IEnumerable<ImageData> images)
            {
                foreach (var item in images ?? Enumerable.Empty<ImageData>())
                {
                    var tokens = item.Image.Split(',');
                    if (tokens.Length > 1)
                    {
                        byte[] buffer = Convert.FromBase64String(tokens[1]);

                    }
                }
            }
        }
        public class ImageData
        {
            public string Description { get; set; }
            public string Filename { get; set; }
            public string Image { get; set; }
        } */
}
