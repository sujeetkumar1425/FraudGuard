"""
Sample Dataset Generator for Viva & Demonstration.
Generates realistic, standardized sample CSVs for:
1. Credit Card Fraud (Time, V1..V28, Amount, Class)
2. Network Activity (duration, protocol_type, service, flag, src_bytes, dst_bytes, land, wrong_fragment, urgent)
"""

import os
import csv
import random


def generate_sample_creditcard_csv(output_path: str = "data/creditcard_sample.csv", num_records: int = 500):
    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    random.seed(42)

    headers = ["Time"] + [f"V{i}" for i in range(1, 29)] + ["Amount", "Class"]

    with open(output_path, mode="w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(headers)

        for i in range(1, num_records + 1):
            is_fraud = random.random() < 0.08  # ~8% fraud rate in sample
            time = i * 15

            # V14 and V17 are key discriminating features in Kaggle fraud datasets
            v_features = [round(random.gauss(0, 1), 4) for _ in range(28)]
            if is_fraud:
                v_features[13] = round(random.uniform(-5.5, -2.5), 4)  # V14
                v_features[16] = round(random.uniform(-4.5, -2.0), 4)  # V17
                amount = round(random.uniform(400.0, 3200.0), 2)
                cls = 1
            else:
                v_features[13] = round(random.gauss(0.1, 0.8), 4)
                v_features[16] = round(random.gauss(0.1, 0.8), 4)
                amount = round(random.uniform(5.0, 150.0), 2)
                cls = 0

            row = [time] + v_features + [amount, cls]
            writer.writerow(row)

    print(f"[✓] Created sample credit card dataset: '{output_path}' ({num_records} records)")


def generate_sample_network_csv(output_path: str = "data/network_sample.csv", num_records: int = 400):
    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    random.seed(42)

    headers = ["duration", "protocol_type", "service", "flag", "src_bytes", "dst_bytes", "land", "wrong_fragment", "urgent"]
    protocols = ["tcp", "udp", "icmp"]
    services = ["http", "ftp", "ssh", "smtp", "dns", "telnet", "pop3"]

    with open(output_path, mode="w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(headers)

        for i in range(1, num_records + 1):
            is_anomaly = random.random() < 0.10
            proto = random.choice(protocols)
            service = random.choice(services)

            if is_anomaly:
                flag = random.choice(["S0", "REJ", "RSTO", "SH"])
                src_bytes = random.randint(100000, 500000)
                dst_bytes = random.randint(0, 100)
                duration = round(random.uniform(45.0, 250.0), 2)
            else:
                flag = "SF"
                src_bytes = random.randint(200, 4500)
                dst_bytes = random.randint(500, 8000)
                duration = round(random.uniform(0.1, 15.0), 2)

            row = [duration, proto, service, flag, src_bytes, dst_bytes, 0, 0, 0]
            writer.writerow(row)

    print(f"[✓] Created sample network activity dataset: '{output_path}' ({num_records} records)")


if __name__ == "__main__":
    generate_sample_creditcard_csv()
    generate_sample_network_csv()
