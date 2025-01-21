import pandas as pd
import datetime
import joblib
from xgboost import XGBClassifier
# from sklearn.ensemble import RandomForestClassifier
# from sklearn.linear_model import LogisticRegression
# from sklearn.ensemble import AdaBoostClassifier
from sklearn.model_selection import train_test_split
import websockets
import asyncio
import json
from sklearn.metrics import confusion_matrix
from imblearn.over_sampling import SMOTE


class GensetAnomalyDetector:
    # def __init__(self, csv_file, model_dir="logR_models"):
    def __init__(self, csv_file, model_dir="xgboost_models"):
    # def __init__(self, csv_file, model_dir="randomforest_models"):
    # def __init__(self, csv_file, model_dir="adaboost_models"):
    
        self.model_dir = model_dir
        self.data = pd.read_csv(csv_file)
        self.transform_data()
        self.process_data()
        self.models = {}
        self.load_or_train_models()

    def transform_data(self):
        affectors = [
            'mainsL2Volts', 'mainsL3Volts', 'mainsL1L2Volts', 'mainsL2L3Volts', 'mainsL3L1Volts','genL1Volts', 'genL2Volts', 'genL3Volts', 'genL1L2Volts', 'genL2L3Volts', 'engChargeAltVolts',
            'genL3L1Volts', 'engOilPress', 'engSpeedDisplay'
        ]

        def det_state(row):
            if all(row[col] > 0 for col in affectors):
                return 'ON'
            elif all(row[col] == 0 for col in affectors):
                return 'OFF'
            else:
                return 'ERROR'

        self.data['dgSetState'] = self.data.apply(det_state, axis=1)
        self.data = self.data[self.data['dgSetState'] != 'OFF']
        self.data = self.data[self.data['dgSetState'] != 'ERROR']
        self.data = self.data.reset_index(drop=True)
        
        self.data["engOilPress"]= self.data["engOilPress"] /100
        self.data["engBatteryVolts"]= self.data["engBatteryVolts"] /10
        self.data["engChargeAltVolts"]= self.data["engChargeAltVolts"] /10
        self.data["genL1Volts"]= self.data["genL1Volts"]/10
        self.data["genL2Volts"]= self.data["genL2Volts"]/10
        self.data["genL3Volts"]= self.data["genL3Volts"]/10
        self.data["genL1Current"]= self.data["genL1Current"] /10 
        self.data["genL2Current"]= self.data["genL2Current"] /10 
        self.data["genL3Current"]= self.data["genL3Current"] /10 
            
            
    def process_data(self):
        self.data = self.data[self.data["dgSetState"] == "ON"]

        self.data["genL1L2L3Current"] = (
            self.data["genL1Current"] + self.data["genL2Current"] + self.data["genL3Current"]).round(2)

        self.data["activepower1"] = (
            self.data["genL1Volts"] * self.data["genL1Current"] * 0.8).round(2)
        self.data["activepower2"] = (
            self.data["genL2Volts"] * self.data["genL2Current"] * 0.8).round(2)
        self.data["activepower3"] = (
            self.data["genL3Volts"] * self.data["genL3Current"] * 0.8).round(2)

        self.data["apparentpower1"] = (
            self.data["genL1Volts"] * self.data["genL1Current"] * 1.73).round(2)
        self.data["apparentpower2"] = (
            self.data["genL2Volts"] * self.data["genL2Current"] * 1.73).round(2)
        self.data["apparentpower3"] = (
            self.data["genL3Volts"] * self.data["genL3Current"] * 1.73).round(2)

        self.data["activepoweravg"] = (
            self.data["activepower1"] + self.data["activepower2"] + self.data["activepower3"]) / 3
        self.data["apparentpoweravg"] = (
            self.data["apparentpower1"] + self.data["apparentpower2"] + self.data["apparentpower3"]) / 3

        self.data["engSpeedDisplay_label"] = self.data["engSpeedDisplay"].apply(
            lambda x: 1 if (x > 1515 or x < 1485) else 0)
        self.data["engOilPress_label"] = self.data["engOilPress"].apply(
            lambda x: 1 if (x > 3.5 or x < 1.5) else 0)
        self.data["engBatteryVolts_label"] = self.data["engBatteryVolts"].apply(
            lambda x: 1 if (x > 15 or x < 10) else 0)
        self.data["genL1Volts_label"] = self.data["genL1Volts"].apply(
            lambda x: 1 if (x > 245 or x < 225) else 0)
        self.data["genL2Volts_label"] = self.data["genL2Volts"].apply(
            lambda x: 1 if (x > 245 or x < 225) else 0)
        self.data["genL3Volts_label"] = self.data["genL3Volts"].apply(
            lambda x: 1 if (x > 245 or x < 225) else 0)
        self.data["genL1Current_label"] = self.data["genL1Current"].apply(
            lambda x: 1 if (x > 22) else 0)
        self.data["genL2Current_label"] = self.data["genL2Current"].apply(
            lambda x: 1 if (x > 22) else 0)
        self.data["genL3Current_label"] = self.data["genL3Current"].apply(
            lambda x: 1 if (x > 22) else 0)
        self.data["genL1L2L3Current_label"] = self.data["genL1L2L3Current"].apply(
            lambda x: 1 if (x > 22) else 0)
        self.data["engChargeAltVolts_label"] = self.data["engChargeAltVolts"].apply(lambda x: 1 if (x > 13 or x < 10) else 0)
        
        self.data["engineFuelLevelUnits_label"] = self.data["engineFuelLevelUnits"].apply(lambda x: 1 if (x < 5) else 0)

        

        self.final_data = self.data[[
            "engSpeedDisplay", "engSpeedDisplay_label", "engOilPress", "engOilPress_label", "engBatteryVolts", "engBatteryVolts_label",
            "genL1Volts", "genL1Volts_label", "genL2Volts", "genL2Volts_label", "genL3Volts", "genL3Volts_label",
            "genL1Current", "genL1Current_label", "genL2Current", "genL2Current_label", "genL3Current", "genL3Current_label", 
            "genL1L2L3Current", "genL1L2L3Current_label", "engChargeAltVolts", "engChargeAltVolts_label", "activepoweravg", "apparentpoweravg", "engineFuelLevelUnits", "engineFuelLevelUnits_label"]]

        self.X = self.final_data[[
            "engSpeedDisplay", "engOilPress", "engBatteryVolts", "engChargeAltVolts",
            "genL1Volts", "genL2Volts", "genL3Volts","genL1Current","genL2Current","genL3Current", "genL1L2L3Current", "engineFuelLevelUnits"]]

        self.labels = [
            "engSpeedDisplay", "engOilPress", "engBatteryVolts", "engChargeAltVolts",
            "genL1Volts", "genL2Volts", "genL3Volts","genL1Current","genL2Current","genL3Current", "genL1L2L3Current","engineFuelLevelUnits"]

    def load_or_train_models(self):
        for label in self.labels:
            model_path = f"{self.model_dir}/{label}_model.pkl"
            try:
                self.models[label] = joblib.load(model_path)
                print(f"Loaded pretrained model for {label}")
            except FileNotFoundError:
                print(f"Training new model for {label}")

                y = self.final_data[f"{label}_label"]
                # Add this line to inspect class distribution
                print(f"Label distribution for {label}: {y.value_counts()}")

                if y.nunique() <= 1:
                    print(f"Skipping model training for {
                          label}: only one class present.")
                    continue

                smote = SMOTE(random_state=42)
                X_res, y_res = smote.fit_resample(self.X, y)

                print(f"After SMOTE, label distribution for {label}: {pd.Series(
                    y_res).value_counts()}")  # Add this line to inspect after SMOTE

                X_train, X_test, y_train, y_test = train_test_split(
                    X_res, y_res, test_size=0.4, random_state=42)

                # model = AdaBoostClassifier(random_state=42)
                # model= RandomForestClassifier(random_state=42)
                model= XGBClassifier(alpha=0.1,random_state=42, learning_rate=0.05, gamma=5 )
                # model= LogisticRegression(random_state=42)
                
                model.fit(X_train, y_train)

                y_pred = model.predict(X_test)
                cm = confusion_matrix(y_test, y_pred)
                print(f"Confusion Matrix for {label}:")
                print(cm)

                joblib.dump(model, model_path)
                self.models[label] = model

        for label in self.labels:
            model = self.models.get(label)
            if model:
                self.final_data.loc[:, f"{label}_pred"] = model.predict(self.X)

    def prepare_json_data(self, row):
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        json_data = {
        "timestamp": timestamp,
        # "engineFuelLevel": {
        #     "value": row["engineFuelLevelUnits"],
        #     "unit": "Litres",
        # },
    }
        for label in self.labels:
            model = self.models.get(label)
            if model:
                pred = model.predict([self.X.iloc[row.name]])[0]
            else:
                pred = 0

            value = row[label].item() if isinstance(
                row[label], (pd.Series, pd.DataFrame)) else row[label]
            value = int(value) if isinstance(
                value, pd.Timestamp) == False else value

            unit = "Rpm" if "Speed" in label else "Bar" if "OilPress" in label else "Volts" if "Volts" in label else "Litres" if label == "engineFuelLevelUnits" else "Ampere"
            json_data[f"{label}"] = {
                "value": value,
                "unit": unit,
                "is_anomaly": bool(pred)
            }

        return json_data

    async def handle_connection(self, websocket):
        if self.final_data.empty:
            print("No data available for WebSocket.")
            await websocket.close()
            return

        row_index = 0
        while True:
            row = self.final_data.iloc[row_index] if row_index < len(
                self.final_data) else self.data.iloc[-1]
            json_data = self.prepare_json_data(row)
            await websocket.send(json.dumps(json_data))
            row_index = (row_index + 1) % len(self.final_data)
            await asyncio.sleep(6)
        
    async def start_server(self):
        server = await websockets.serve(self.handle_connection, "localhost", 8766)
        print("WebSocket server running on ws://localhost:8766")
        await server.wait_closed()


csv_file = "dataset3.csv"
genset = GensetAnomalyDetector(csv_file)
asyncio.run(genset.start_server())