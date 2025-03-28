using D3Dashboard.Web.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;

namespace D3Dashboard.Web.Controllers
{
    public class DashboardController : Controller
    {
        public IActionResult Index()
        {
            var model = new DashboardViewModel
            {
                Categories = new List<string> { "Electronics", "Furniture", "Clothing" }
            };
            return View(model);
        }

        [HttpPost]
        public IActionResult FilterData(DateTime? startDate, DateTime? endDate, string category)
        {
            Console.WriteLine($"Filter Request - Start: {startDate}, End: {endDate}, Category: {category}");

            var data = new List<ChartData>
            {
                new ChartData { Category = "Electronics", Value = 120, Date = new DateTime(2025, 3, 10) },
                new ChartData { Category = "Furniture", Value = 80, Date = new DateTime(2025, 3, 15) },
                new ChartData { Category = "Clothing", Value = 150, Date = new DateTime(2025, 3, 20) }
            };

            if (!string.IsNullOrWhiteSpace(category))
            {
                data = data.Where(d => d.Category.Equals(category, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            if (startDate.HasValue && endDate.HasValue)
            {
                data = data.Where(d => d.Date >= startDate.Value && d.Date <= endDate.Value).ToList();
            }

            Console.WriteLine("Filtered Data: " + string.Join(", ", data.Select(d => $"{d.Category}: {d.Value}")));

            return Json(data.Select(d => new { Category = d.Category, Value = d.Value, Date = d.Date }));
        }
    }
}
