import requests
import json

# Token
access_token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjNlZTcyNzE3NTgyMDliYjA4MzZiNDU2ZTczNjVhY2JhNTE0MmI0NjY1YzRjOTNhNzk0NWI1MzYyM2IyNDEwMjc4MTVhYWJkOTc1ZWRkYjcwIn0.eyJhdWQiOiIyIiwianRpIjoiM2VlNzI3MTc1ODIwOWJiMDgzNmI0NTZlNzM2NWFjYmE1MTQyYjQ2NjVjNGM5M2E3OTQ1YjUzNjIzYjI0MTAyNzgxNWFhYmQ5NzVlZGRiNzAiLCJpYXQiOjE3NjYwNzgwNzksIm5iZiI6MTc2NjA3ODA3OSwiZXhwIjoxNzk3NjE0MDc5LCJzdWIiOiI0NTQ4Iiwic2NvcGVzIjpbXX0.D3RBKempsHXKQs7JJA1vIxr5Dwa-6iI626WVd_ah__r0Xgxs0U5KMTI8C-ADLSeyaqeutsMmfbWKgUrqQsEUg_BQ_KlOei6nfmAgiXO5kKNgIodyHNYlGUppAMPgwux2TdF-8rjXpepn_s8Eq_zqSr9Aj8qLBTUCjDblh1jgBjfdAv3AucXDB2jumz7LWoaMAgz4-gxSktTU7NXl3rehjBItCF0b1J6GGQaDe6tKS80DaCmRNERfXc5Lk1Ytdj-G1Eg2G1Mkw5hqN3w5yBHbQNyOYCKZ2JEGcIjSGirHxwSZK4y2UJsCqD7eWRmuuQKdcMCRg_vExgr16pBNdAGyD_d4TmKd9HbPccl-je9v1QBa2PoZXj2M8CWineCgoCf-_JPrZ3IFKnL3Mb66UsJsJm_pvA_wUfz9cm4Kpf9BU6dn7MTgmf6VIUT-h_NbjlTa0SC2wJBwwd5V80JD4xr0nzdmVCafM8TongNC2oooPxsRiGUIl956945BqyK0nNojCRVXBD0wcKEIaQUvQYtYlgPiegx0F_srOo22vv4YXqRJTwijWg5COCXnlseRA8oAbbXNpsbE_as2ht_MNGHOWyCrbgAV9wdg1kmN1fdS1qIYFBj7c0QKBd-Golyi4T3cYENVfa8ycwL5UhsTogItsBevm_nmjAss_mjydyql1lg"

headers = {
    "accept": "application/json",
    "authorization": f"Bearer {access_token}"
}

# Try different URL formats
urls = [
    # Original
    "https://data.tmd.go.th/nwpapi/v1/forecast/location/hourly/at?lat=13.7563&lon=100.5018&date=2025-12-19&duration=24&fields=tc,rh,rain",
    # With /at
    "https://data.tmd.go.th/nwpapi/v1/forecast/location/hourly/at?lat=13.7563&lon=100.5018&duration=2&fields=tc,rh,rain",
    # Just location no /hourly
    "https://data.tmd.go.th/nwpapi/v1/forecast/location/hourly?lat=13.7563&lon=100.5018&hour=2&fields=tc,rh,rain",
]

for url in urls:
    print(f"\n{'='*60}")
    print(f"Testing: {url[:80]}...")
    try:
        response = requests.get(url, headers=headers, timeout=10)
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Keys: {list(data.keys())}")
        if 'WeatherForecasts' in data:
            print("SUCCESS! Found WeatherForecasts!")
            print(json.dumps(data, indent=2, ensure_ascii=False)[:500])
        else:
            print(f"Response: {json.dumps(data, indent=2)[:200]}")
    except Exception as e:
        print(f"Error: {e}")
