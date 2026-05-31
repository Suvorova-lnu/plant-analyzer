import torch
import torchvision.models as models
import torch.nn as nn
from torchvision import transforms
from PIL import Image, ImageOps
import json
import io
import os

try:
    from pillow_heif import register_heif_opener
    register_heif_opener()
except:
    pass

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

with open(os.path.join(BASE_DIR, "class_names_v2.json")) as f:
    CLASS_NAMES = json.load(f)

model = models.mobilenet_v2(pretrained=False)
model.classifier[1] = nn.Linear(model.last_channel, len(CLASS_NAMES))
model.load_state_dict(torch.load(
    os.path.join(BASE_DIR, "plant_model_v2.pth"),
    map_location="cpu"
))
model.eval()

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

def predict(image_bytes: bytes):
    try:
        image = Image.open(io.BytesIO(image_bytes))
        image = ImageOps.exif_transpose(image)
        image = image.convert("RGB")
    except Exception as e:
        raise ValueError(f"Не вдалось відкрити зображення: {e}")
    
    tensor = transform(image).unsqueeze(0)
    with torch.no_grad():
        probs = torch.softmax(model(tensor), dim=1)[0]
    top3 = torch.topk(probs, 3)
    return [
        {
            "label": CLASS_NAMES[i].replace("___", " — ").replace("_", " "),
            "confidence": round(float(p) * 100, 1)
        }
        for p, i in zip(top3.values, top3.indices)
    ]