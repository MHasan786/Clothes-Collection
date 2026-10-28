import React from 'react';
import { X } from 'lucide-react';

export const SizeGuideModal = ({ isOpen, onClose, gender = 'men' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/75 backdrop-blur-xs" onClick={onClose} />
      <div className="min-h-screen px-4 text-center flex items-center justify-center py-8">
        <div className="inline-block w-full max-w-2xl bg-[#FAF9F5] border border-[#E8E0D5] p-6 sm:p-8 text-left shadow-2xl relative z-10">
          <div className="flex items-center justify-between border-b border-[#E8E0D5] pb-4">
            <div>
              <h3 className="font-serif text-2xl font-bold text-[#1A1A1A]">Atelier Size Guide</h3>
              <p className="text-xs text-[#9C8570]">Standard Body Measurements in Inches & Centimeters</p>
            </div>
            <button onClick={onClose} className="p-1 text-[#9C8570] hover:text-[#1A1A1A] cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-6 space-y-6">
            {/* Table */}
            <div className="overflow-x-auto border border-[#E8E0D5]">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#F3EFEA] border-b border-[#E8E0D5] text-[#1A1A1A] font-semibold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Size</th>
                    <th className="py-2.5 px-3">Chest / Bust (in)</th>
                    <th className="py-2.5 px-3">Waist (in)</th>
                    <th className="py-2.5 px-3">Hips (in)</th>
                    <th className="py-2.5 px-3">Length (in)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E0D5] text-[#4A4A4A]">
                  <tr>
                    <td className="py-2 px-3 font-bold text-[#1A1A1A]">XS</td>
                    <td className="py-2 px-3">34 - 36</td>
                    <td className="py-2 px-3">28 - 30</td>
                    <td className="py-2 px-3">35 - 37</td>
                    <td className="py-2 px-3">28.5</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-[#1A1A1A]">S</td>
                    <td className="py-2 px-3">36 - 38</td>
                    <td className="py-2 px-3">30 - 32</td>
                    <td className="py-2 px-3">37 - 39</td>
                    <td className="py-2 px-3">29.0</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-[#1A1A1A]">M</td>
                    <td className="py-2 px-3">38 - 40</td>
                    <td className="py-2 px-3">32 - 34</td>
                    <td className="py-2 px-3">39 - 41</td>
                    <td className="py-2 px-3">29.5</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-[#1A1A1A]">L</td>
                    <td className="py-2 px-3">40 - 42</td>
                    <td className="py-2 px-3">34 - 36</td>
                    <td className="py-2 px-3">41 - 43</td>
                    <td className="py-2 px-3">30.0</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-[#1A1A1A]">XL</td>
                    <td className="py-2 px-3">42 - 44</td>
                    <td className="py-2 px-3">36 - 38</td>
                    <td className="py-2 px-3">43 - 45</td>
                    <td className="py-2 px-3">30.5</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-[#1A1A1A]">XXL</td>
                    <td className="py-2 px-3">44 - 46</td>
                    <td className="py-2 px-3">38 - 40</td>
                    <td className="py-2 px-3">45 - 47</td>
                    <td className="py-2 px-3">31.0</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* How to measure */}
            <div className="bg-[#F3EFEA] p-4 border border-[#E8E0D5] space-y-2 text-xs text-[#6B5E51]">
              <h4 className="font-bold text-[#1A1A1A] uppercase tracking-wider text-[11px]">
                How to Measure Correctly
              </h4>
              <ul className="space-y-1 list-disc list-inside">
                <li><strong>Chest/Bust:</strong> Measure around the fullest part of your chest, keeping the tape level under your arms.</li>
                <li><strong>Waist:</strong> Measure around your natural waistline, keeping the tape comfortably loose.</li>
                <li><strong>Fit note:</strong> If you are between sizes, we recommend sizing up for traditional and tailored cuts.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
